
import fs from 'fs';

import { Inject } from 'typescript-ioc';

import Jimp from 'jimp';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { PresenceService } from '../services/presence';
import { AbilityService } from '../services/ability';
import { CharResolverService } from '../services/char-resolver';

export class AbilityCommand implements ICommand {

  help = `Display a character ability! Do \`!ability eye for an eye\` to see Eye for an Eye, \`!ability brute all\` to see all Brute skills and \`!ability brute x\` to see all Brute Level X abilities.`;

  aliases = ['a', 'ability'];

  @Inject private charService: CharResolverService;
  @Inject private abilityService: AbilityService;
  @Inject private presenceService: PresenceService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;
    const retVal = { resultString: JSON.stringify({ query: args, requester: message.author.username, requesterTag: message.author.tag }) };

    const [potentialChar, potentialLevel] = args.split('|').join('').split(' ').map((a) => a.toLowerCase());
    const realChar = this.charService.resolveClass(potentialChar);

    const validLevels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'x', 'm', 'all', 'a', 'b'];

    if (realChar && potentialLevel && validLevels.includes(potentialLevel)) {

      if (!potentialLevel) {
        message.channel.send(`You need to specify a level, like so: \`!ability brute 2\`.`);
        return retVal;
      }

      const cards = potentialLevel !== 'all'
                  ? this.abilityService.getAbilitiesByCharacterLevel(realChar, potentialLevel)
                  : this.abilityService.getAbilitiesByCharacter(realChar);

      if (cards.length === 0) {
        message.channel.send(`Sorry! I could not find any cards for that character/level combination.`);
        return retVal;
      }

      const fileName = `${realChar}-${potentialLevel || 'all'}.jpg`;
      const path = `assets/tmp/${fileName}`;

      if (!fs.existsSync(path)) {
        const allImages = await Promise.all(cards.map((c) => Jimp.read(c.longImage)));
        const cardWidth = allImages[0].getWidth();
        const cardHeight = allImages[0].getHeight();

        const divisor = potentialLevel === 'all' ? 6 : 4;

        const rows = Math.ceil(allImages.length / divisor);
        const cols = allImages.length > divisor ? divisor : allImages.length;

        let currentCol = 0;
        let currentRow = 0;

        const baseImage = new Jimp(cardWidth * cols, cardHeight * rows);

        const sumImage = allImages.reduce((prev, cur, idx) => {
          const newImg = prev.blit(cur, currentCol * cardWidth, currentRow * cardHeight);
          currentCol++;

          if (currentCol === divisor) {
            currentRow++;
            currentCol = 0;
          }

          return newImg;
        }, baseImage);

        await sumImage.quality(potentialLevel === 'all' ? 30 : 50).writeAsync(path);
      }

      const attachFile = [
        {
          attachment: path,
          name: `SPOILER_${path}`
        }
      ];

      await message.channel.send({ files: attachFile });

      return retVal;
    }

    const ability = this.abilityService.getAbility(args);
    if (!ability) {
      message.channel.send(`Sorry! I could not find anything like "${args}"`);
      return retVal;
    }

    const attachFiles = [
      {
        attachment: ability.longImage,
        name: `SPOILER_${ability.image}`
      }
    ];

    this.presenceService.setPresence(`with ${ability.name}`);

    message.channel.send({ files: attachFiles });

    return retVal;
  }

}

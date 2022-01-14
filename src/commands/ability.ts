
import fs from 'fs';

import { uniqBy } from 'lodash';
import { Inject } from 'typescript-ioc';

import Jimp from 'jimp';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { PresenceService } from '../services/presence';
import { AbilityService } from '../services/ability';
import { CharResolverService } from '../services/char-resolver';

export class AbilityCommand implements ICommand {

  help = `Display a character ability! Do \`!ability eye for an eye\` to see Eye for an Eye, \`!ability brute all\` to see all Brute skills and \`!ability brute x\` to see all Brute Level X abilities. Other things you can search by: a (augments), c (||command||), d (||doom||), s (||song||, ||summon||)`;

  aliases = ['a', 'ability', 'abilityg', 'abilityj', 'ag', 'aj'];

  @Inject private charService: CharResolverService;
  @Inject private abilityService: AbilityService;
  @Inject private presenceService: PresenceService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args, cmd } = cmdArgs;
    const retVal = { resultString: JSON.stringify({ query: args, requester: message.author.username, requesterTag: message.author.tag }) };

    const [potentialChar, potentialLevel] = args.split('|').join('').split(' ').map((a) => a.toLowerCase());
    const realChar = this.charService.resolveClass(potentialChar);

    const validLevels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'all', 'a', 'b', 'c', 'd', 's', 'm', 'x'];

    if (realChar && potentialLevel && validLevels.includes(potentialLevel)) {

      if (!potentialLevel) {
        message.reply(`You need to specify a level, like so: \`!ability brute 2\`.`);
        return retVal;
      }

      const cards = potentialLevel !== 'all'
                  ? this.abilityService.getAbilitiesByCharacterLevel(realChar, potentialLevel)
                  : this.abilityService.getAbilitiesByCharacter(realChar);

      if (cards.length === 0) {
        message.reply(`Sorry! I could not find any cards for that character/level combination (${args}).`);
        return retVal;
      }

      const uniqueCards: any[] = uniqBy(cards, (x) => x.name);

      const fileName = `SPOILER_${realChar}-${potentialLevel || 'all'}.jpg`;
      const path = `assets/tmp/${fileName}`;

      if (!fs.existsSync(path)) {
        const allImages = await Promise.all(uniqueCards.map((c) => Jimp.read(c.longImage)));
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

      try {
        await message.channel.send({ files: attachFile });
      } catch {
        message.channel.send('Could not create/upload file. Try again?');
      }

      return retVal;
    }

    let prepend = '';

    if (cmd.endsWith('g')) { prepend = 'Gloomhaven'; }
    if (cmd.endsWith('j')) { prepend = 'JOTL'; }
    if (cmd.endsWith('c')) { prepend = 'Custom'; }

    const query = prepend ? `${prepend} ${args}` : args;

    const ability = this.abilityService.getAbility(query);
    if (!ability) {
      message.reply(`Sorry! I could not find anything like "${args}"`);
      return retVal;
    }

    const attachFiles = [
      {
        attachment: ability.longImage,
        name: `SPOILER_${ability.image}`
      }
    ];

    this.presenceService.setPresence(`with ${ability.name}`);

    try {
      message.channel.send({ files: attachFiles });
    } catch {
      message.channel.send('Could not create/upload file. Try again?');
    }

    return retVal;
  }

}

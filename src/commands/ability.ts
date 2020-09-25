
import fs from 'fs';

import { Inject } from 'typescript-ioc';

import Jimp from 'jimp';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { PresenceService } from '../services/presence';
import { AbilityService } from '../services/ability';

const Characters = {
  'brute':        ['1'],
  'circles':      ['9', 'summoner'],
  'cragheart':    ['5'],
  'cthulhu':      ['11', 'plagueherald'],
  'diviner':      ['18'],
  'eclipse':      ['10', 'nightshroud'],
  'lightning':    ['12', 'lightningbolts', 'lightningbolt', 'lightning-bolt', 'berserker'],
  'mindthief':    ['6'],
  'music-note':   ['13', 'musicnote', 'soothsinger', 'music', 'bard'],
  'saw':          ['15', 'sawbones'],
  'scoundrel':    ['4'],
  'spellweaver':  ['3'],
  'spike-head':   ['14', 'spikehead', 'doomstalker', 'angryface', 'angry-face'],
  'sun':          ['7', 'sunkeeper'],
  'three-spears': ['8', 'threespears', 'quartermaster', 'spears'],
  'three-swords': ['x', 'threeswords', 'bladeswarm'],
  'tinkerer':     ['2'],
  'triangles':    ['16', 'elementalist', 'triforce'],
  'two-minis':    ['17', 'twominis', 'beasttyrant', 'tyrant', 'phoenix'],
  'manifestation-of-corruption': ['manifestation'],
};

const AllCharacterAliases = Object.keys(Characters).reduce((prev, cur) => {
  prev[cur] = cur;
  Characters[cur].forEach((c) => prev[c] = cur);

  return prev;
}, {});

export class AbilityCommand implements ICommand {

  help = `Display a character ability! Do \`!ability eye for an eye\` to see Eye for an Eye, \`!ability brute all\` to see all Brute skills and \`!ability brute x\` to see all Brute Level X abilities.`;

  aliases = ['a', 'ability', 'abilityg', 'abilityf', 'abilityj'];

  @Inject private abilityService: AbilityService;
  @Inject private presenceService: PresenceService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;

    const [potentialChar, potentialLevel] = args.split(' ').map((a) => a.toLowerCase());
    const realChar = AllCharacterAliases[potentialChar];

    const validLevels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'x', 'm', 'all', 'a', 'b'];

    if (realChar && potentialLevel && validLevels.includes(potentialLevel)) {

      if (!potentialLevel) {
        message.channel.send(`You need to specify a level, like so: \`!ability brute 2\`.`);
        return;
      }

      const cards = potentialLevel !== 'all'
                  ? this.abilityService.getGloomAbilitiesByCharacterLevel(realChar, potentialLevel)
                  : this.abilityService.getGloomAbilitiesByCharacter(realChar);

      if (cards.length === 0) {
        message.channel.send(`Sorry! I could not find any cards for that character/level combination.`);
        return;
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

      return { };
    }

    const ability = this.abilityService.getGloomAbility(args);
    if (!ability) {
      message.channel.send(`Sorry! I could not find anything like "${args}"`);
      return;
    }

    const attachFiles = [
      {
        attachment: ability.longImage,
        name: `SPOILER_${ability.image}`
      }
    ];

    this.presenceService.setPresence(`with ${ability.name}`);

    message.channel.send({ files: attachFiles });

    return { };
  }

}

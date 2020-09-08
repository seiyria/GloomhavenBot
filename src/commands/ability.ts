
import fs from 'fs';

import { Inject } from 'typescript-ioc';

import Jimp from 'jimp';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { PresenceService } from '../services/presence';
import { AbilityService } from '../services/ability';

const Characters = {
  'brute': [],
  'circles': ['summoner'],
  'cragheart': [],
  'cthulhu': ['plagueherald'],
  'diviner': [],
  'eclipse': ['nightshroud'],
  'lightning': ['berserker'],
  'manifestation-of-corruption': ['manifestation'],
  'mindthief': [],
  'music-note': ['musicnote', 'soothsinger'],
  'saw': ['sawbones'],
  'scoundrel': [],
  'spellweaver': [],
  'spike-head': ['spikehead', 'doomstalker'],
  'sun': ['sunkeeper'],
  'three-spears': ['threespears', 'quartermaster'],
  'three-swords': ['threeswords', 'bladeswarm'],
  'tinkerer': [],
  'triangles': ['elementalist'],
  'two-minis': ['twominis', 'beasttyrant', 'tyrant']
};

const AllCharacterAliases = Object.keys(Characters).reduce((prev, cur) => {
  prev[cur] = cur;
  Characters[cur].forEach((c) => prev[c] = cur);

  return prev;
}, {});

export class AbilityCommand implements ICommand {

  help = `Display a character ability! Do \`!ability eye for an eye\` to see one, \`!ability brute\` to see all Brute abilities, and \`!ability brute x\` to see all Brute Level X abilities.`;

  aliases = ['ability', 'abilityg', 'abilityf', 'abilityj'];

  @Inject private abilityService: AbilityService;
  @Inject private presenceService: PresenceService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;

    const [potentialChar, potentialLevel] = args.split(' ').map((a) => a.toLowerCase());
    if (AllCharacterAliases[potentialChar]) {

      if (!potentialLevel) {
        message.channel.send(`You need to specify a level, like so: \`!ability brute 2\`.`);
        return;
      }

      const cards = potentialLevel
                  ? this.abilityService.getGloomAbilitiesByCharacterLevel(potentialChar, potentialLevel)
                  : this.abilityService.getGloomAbilitiesByCharacter(potentialChar);

      if (cards.length === 0) {
        message.channel.send(`Sorry! I could not find any cards for that character/level combination.`);
        return;
      }

      const path = `assets/tmp/${potentialChar}-${potentialLevel || 'all'}.jpg`;

      if (!fs.existsSync(path)) {
        const allImages = await Promise.all(cards.map((c) => Jimp.read(c.longImage)));
        const sumWidth = allImages.reduce((prev, cur) => prev + cur.getWidth(), 0);
        let runningWidth = 0;

        const baseImage = new Jimp(sumWidth, allImages[0].getHeight());

        const sumImage = allImages.reduce((prev, cur) => {
          const newImg = prev.blit(cur, runningWidth, 0);
          runningWidth += cur.getWidth();

          return newImg;
        }, baseImage);

        await sumImage.writeAsync(path);
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

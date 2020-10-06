
import { Inject } from 'typescript-ioc';

import * as Discord from 'discord.js';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { CharResolverService } from '../services/char-resolver';
import { ClassDataService } from '../services/classdata';
import { TextParserService } from '../services/text-parser';

export class ClassDataCommand implements ICommand {

  help = `Display a character class overview! Do \`!classinfo brute\``;

  aliases = ['ci', 'cd', 'classinfo', 'classdata'];

  @Inject private textService: TextParserService;
  @Inject private charService: CharResolverService;
  @Inject private classDataService: ClassDataService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;

    const searchClass = args.toLowerCase().trim();
    const realChar = this.charService.resolveClass(searchClass);

    if (!realChar) {
      message.channel.send('That class could not be found!');
      return;
    }

    const classData = this.classDataService.getClassData(realChar);
    if (!classData) {
      message.channel.send('Oops! That class doesn\'t have any data inputted!');
      return;
    }

    const attachFiles = [
      `./assets/gloomhaven/images/icons/${realChar}.png`
    ];

    const embed = new Discord.RichEmbed()
      .attachFiles(attachFiles)
      .setAuthor('Class Overview', `attachment://${realChar}.png`)
      .setTitle(`||${classData.name}||`);

    embed.addField('HP', `||${classData.hp.join(' | ')}||`, true);
    embed.addField('Hand Size', `||${classData.handSize}||`, true);

    if (classData.extraHP) {
      embed.addField('||Secondary HP||', `||${classData.extraHP.join(' | ')}||`);
    }

    const perkText = classData.perks.map((p) => `${Array(p.count || 1).fill('▫️').join(' ')} ${this.textService.formatTextForEmojis(p.text)}`);

    embed.addField('Perks', perkText);

    message.channel.send({ embed });

    return { };
  }

}

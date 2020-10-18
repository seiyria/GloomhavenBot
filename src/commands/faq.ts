import { Inject } from 'typescript-ioc';
import * as Discord from 'discord.js';

import { FAQService } from '../services/faq';
import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';

export class FAQCommand implements ICommand {

  help = `Check the FAQ! Do !faq <query> to look for things in the FAQ!`;

  aliases = ['faq'];

  @Inject private faqService: FAQService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;
    const retVal = { resultString: JSON.stringify({ query: args, requester: message.author.username, requesterTag: message.author.tag }) };

    const query = args.split('|').join('');

    const res = this.faqService.getFAQ(query);
    if (!res) {
      message.channel.send(`There are no FAQ results for that query.`);
      return retVal;
    }

    const attachFiles = [];

    /*
    if (res.icon) {
      attachFiles.push(
        {
          attachment: `assets/${res.game.toLowerCase()}/images/icons/${res.icon}.png`,
          name: res.icon
        }
      );
    }
    */

    const embed = new Discord.RichEmbed()
      .attachFiles(attachFiles)
      .setAuthor(`${res.query}`, res.icon ? `attachment://${res.icon}` : '');

    res.results.forEach(({ title, content }) => {
      embed.addField(`${title}`, `||${content}||`);
    });

    message.channel.send({ embed });

    return retVal;
  }
}

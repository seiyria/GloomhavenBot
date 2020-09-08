
import { Inject } from 'typescript-ioc';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { HelpService } from '../services/help';
import { EnvService } from '../services/env';
import { EmojiService } from '../services/emoji';

export class HelpCommand implements ICommand {

  help = 'Display this message!';
  aliases = ['ghelp'];

  @Inject private envService: EnvService;
  @Inject private helpService: HelpService;
  @Inject private emojiService: EmojiService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message } = cmdArgs;
    message.author.send(`
**__All Commands__**

${this.helpService.allHelp.map(({ aliases, help }) => {
  return `__${aliases.map((x) => `\`${this.envService.commandPrefix}${x}\``).join(', ')}__\n${help}\n`;
})
.join('\n')}

_For bot info, reach out to Seiyria#3457_
`
    );

    if (message.channel.type !== 'dm') {
      message.reply(this.emojiService.getEmoji('notify'));
    }

    return { resultString: 'helped' };
  }
}

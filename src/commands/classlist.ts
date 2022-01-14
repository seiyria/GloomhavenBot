
import { Inject } from 'typescript-ioc';

import * as Discord from 'discord.js';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { CharResolverService } from '../services/char-resolver';

export class ClassListCommand implements ICommand {

  help = `Display a list of all classes!`;

  aliases = ['cl', 'classlist'];

  @Inject private charService: CharResolverService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {

    const { message } = cmdArgs;

    message.reply(this.charService.allClasses.join(', '));

    return { };
  }

}

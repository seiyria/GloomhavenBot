
import { Inject } from 'typescript-ioc';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { PresenceService } from '../services/presence';
import { PersonalGoalService } from '../services/personalgoal';

export class PersonalGoalCommand implements ICommand {

  help = `Display a personal goal! Do \`!pgoal Zealot of the Blood God\``;

  aliases = ['pg', 'pgoal', 'pgoalg', 'pgoalf'];

  @Inject private pgoalService: PersonalGoalService;
  @Inject private presenceService: PresenceService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;

    const pgoal = this.pgoalService.getGloomPersonalGoal(args.split('|').join(''));
    if (!pgoal) {
      message.channel.send(`Sorry! I could not find anything like "${args}"`);
      return;
    }

    const attachFiles = [
      {
        attachment: pgoal.longImage,
        name: `SPOILER_${pgoal.image}`
      }
    ];

    this.presenceService.setPresence(`with ${pgoal.name}`);

    message.channel.send({ files: attachFiles });

    return { };
  }

}

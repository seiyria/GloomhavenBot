
import { Inject } from 'typescript-ioc';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { PresenceService } from '../services/presence';
import { BattleGoalService } from '../services/battlegoal';

export class BattleGoalCommand implements ICommand {

  help = `Display a battle goal! Do \`!bgoal Purist\``;

  aliases = ['bg', 'bgoal', 'bgoalg', 'bgoalj', 'bgg', 'bgj'];

  @Inject private pgoalService: BattleGoalService;
  @Inject private presenceService: PresenceService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;

    const bgoal = this.pgoalService.getGloomBattleGoal(args.split('|').join(''));
    if (!bgoal) {
      message.channel.send(`Sorry! I could not find anything like "${args}"`);
      return;
    }

    const attachFiles = [
      {
        attachment: bgoal.longImage,
        name: `SPOILER_${bgoal.image}`
      }
    ];

    this.presenceService.setPresence(`with ${bgoal.name}`);

    message.channel.send({ files: attachFiles });

    return { };
  }

}

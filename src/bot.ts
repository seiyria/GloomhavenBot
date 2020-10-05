
import * as Discord from 'discord.js';
import { Inject } from 'typescript-ioc';

import { ICommandResult } from './interfaces';

import { LoggerService } from './services/logger';
import { CommandParser } from './services/command-parser';
import { PresenceService } from './services/presence';
import { EnvService } from './services/env';
import { EmojiService } from './services/emoji';
import { ItemService } from './services/item';
import { HelpService } from './services/help';
import { TextParserService } from './services/text-parser';
import { PersonalGoalService } from './services/personalgoal';
import { BattleGoalService } from './services/battlegoal';
import { AbilityService } from './services/ability';
import { CharResolverService } from './services/char-resolver';
import { ClassDataService } from './services/classdata';

export class Bot {
  @Inject private logger: LoggerService;

  @Inject private helpService: HelpService;
  @Inject private envService: EnvService;
  @Inject private emojiService: EmojiService;
  @Inject private textParserService: TextParserService;
  @Inject private presenceService: PresenceService;

  @Inject private charService: CharResolverService;
  @Inject private classDataService: ClassDataService;
  @Inject private itemService: ItemService;
  @Inject private pgoalService: PersonalGoalService;
  @Inject private bgoalService: BattleGoalService;
  @Inject private abilityService: AbilityService;

  @Inject private commandParser: CommandParser;

  public async init() {
    const DISCORD_TOKEN = this.envService.discordToken;
    const COMMAND_PREFIX = this.envService.commandPrefix;
    if (!DISCORD_TOKEN) { throw new Error('No Discord token specified!'); }

    const client = new Discord.Client();
    client.login(DISCORD_TOKEN);

    client.on('ready', () => {
      this.logger.log('Initialized bot!');

      [
        this.helpService,
        this.envService,
        this.emojiService,
        this.textParserService,
        this.presenceService,

        this.charService,
        this.classDataService,
        this.itemService,
        this.pgoalService,
        this.bgoalService,
        this.abilityService,

        this.commandParser
      ].forEach((s) => s.init(client));
    });

    client.on('message', async (msg) => {
      if (msg.author.bot || msg.author.id === client.user.id) { return; }

      const content = msg.content;

      if (content.startsWith(COMMAND_PREFIX)) {
        const result: ICommandResult = await this.commandParser.handleCommand(msg);
        this.logger.logCommandResult(result);

      } else {
        this.commandParser.handleMessage(msg);

      }
    });

    client.on('messageReactionAdd', async (reaction, user) => {
      if (user.bot) { return; }

      this.commandParser.handleEmojiAdd(reaction, user);
    });

    client.on('messageReactionRemove', async (reaction, user) => {
      if (user.bot) { return; }

      this.commandParser.handleEmojiRemove(reaction, user);
    });
  }
}

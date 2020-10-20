import { AutoWired, Singleton } from 'typescript-ioc';
import * as YAML from 'yamljs';
import { FuzzySetContainer } from 'fuzzyset-obj';

import { BaseService } from '../base/BaseService';
import { Game } from '../interfaces/IGame';

interface IBattleGoal {
  name: string;
  game: Game;
  longImage: string;
  image: string;
}

@Singleton
@AutoWired
export class BattleGoalService extends BaseService {

  private battleGoals: FuzzySetContainer<IBattleGoal> = new FuzzySetContainer<IBattleGoal>({ key: '_key' });

  public async init(client) {
    super.init(client);

    this.loadAll();
  }

  public getBattleGoal(name: string): IBattleGoal {
    try {
      return this.battleGoals.getFirst(name);
    } catch {
      return null;
    }
  }

  private loadAll() {
    ['Gloomhaven', 'JOTL'].forEach((game) => {
      const goals = YAML.load(`assets/${game.toLowerCase()}/battlegoals.yml`);

      goals.forEach((goal) => {
        goal.game = game;

        goal.longImage = `assets/${game.toLowerCase()}/images/battlegoals/${goal.image}`;

        this.battleGoals.add(Object.assign({ _key: goal.name }, goal));
        this.battleGoals.add(Object.assign({ _key: `${game.toLowerCase()} ${goal.name}` }, goal));
        this.battleGoals.add(Object.assign({ _key: `${goal.name} ${game.toLowerCase()}` }, goal));
      });
    });
  }

}

import { AutoWired, Singleton } from 'typescript-ioc';
import * as YAML from 'yamljs';
import { FuzzySetContainer } from 'fuzzyset-obj';

import { BaseService } from '../base/BaseService';

interface IBattleGoal {
  name: string;
  longImage: string;
  image: string;
}

@Singleton
@AutoWired
export class BattleGoalService extends BaseService {

  private gloomBGoals: FuzzySetContainer<IBattleGoal> = new FuzzySetContainer<IBattleGoal>({ key: '_key' });

  public async init(client) {
    super.init(client);

    this.loadAll();
  }

  public getGloomBattleGoal(name: string): IBattleGoal {
    try {
      return this.gloomBGoals.getFirst(name);
    } catch {
      return null;
    }
  }

  private loadAll() {
    this.loadGloomBGoals();
  }

  private loadGloomBGoals() {
    const cards = YAML.load('assets/gloomhaven/battlegoals.yml');

    cards.forEach((card) => {

      card.longImage = `assets/gloomhaven/images/battlegoals/${card.image}`;

      const nameRef = Object.assign({ _key: card.name }, card);

      this.gloomBGoals.add(nameRef);
    });
  }

}

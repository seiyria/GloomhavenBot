import { AutoWired, Singleton } from 'typescript-ioc';
import * as YAML from 'yamljs';
import { FuzzySetContainer } from 'fuzzyset-obj';

import { BaseService } from '../base/BaseService';

interface IPersonalGoal {
  name: string;
  longImage: string;
  image: string;
}

@Singleton
@AutoWired
export class PersonalGoalService extends BaseService {

  private gloomPGoals: FuzzySetContainer<IPersonalGoal> = new FuzzySetContainer<IPersonalGoal>({ key: '_key' });

  public async init(client) {
    super.init(client);

    this.loadAll();
  }

  public getGloomPersonalGoal(name: string): IPersonalGoal {
    return this.gloomPGoals.getFirst(name);
  }

  private loadAll() {
    this.loadGloomPGoals();
  }

  private loadGloomPGoals() {
    const cards = YAML.load('assets/gloomhaven/personalgoals.yml');

    cards.forEach((card) => {

      card.longImage = `assets/gloomhaven/images/personalgoals/${card.image}`;

      const nameRef = Object.assign({ _key: card.name }, card);

      this.gloomPGoals.add(nameRef);
    });
  }

}

import { AutoWired, Singleton } from 'typescript-ioc';
import * as YAML from 'yamljs';
import { uniqBy } from 'lodash';
import { FuzzySetContainer } from 'fuzzyset-obj';

import { BaseService } from '../base/BaseService';

interface IAbility {
  name: string;
  char: string;
  level: string;
  longImage: string;
  image: string;
  requireExact: boolean;
}

@Singleton
@AutoWired
export class AbilityService extends BaseService {

  private isLoaded = false;
  private gloomCards: IAbility[] = [];
  private gloomAbilities: FuzzySetContainer<IAbility> = new FuzzySetContainer<IAbility>({ key: '_key' });

  public async init(client) {
    super.init(client);

    this.loadAll();
  }

  public getAbility(name: string): IAbility {
    try {
      const card: IAbility = this.gloomAbilities.getFirst(name);
      if (card.requireExact && name.toLowerCase() !== card.name.toLowerCase()) { return null; }

      return card;
    } catch {
      return null;
    }
  }

  public getAbilitiesByCharacter(char: string): IAbility[] {
    const filteredCards = this.gloomCards
      .filter((c) => c.char === char);

    return uniqBy(filteredCards, (x) => x.level + x.name);
  }

  public getAbilitiesByCharacterLevel(char: string, level: string): IAbility[] {
    const cards = this.getAbilitiesByCharacter(char)
      .filter((c) => c.level === level.toLowerCase());

    if (['redguard', 'voidwarden', 'hatchet', 'demolitionist'].includes(char) && cards[0].level === '5') {
      return [cards[0], cards[0]];
    }

    return cards;
  }

  private loadAll() {
    if(this.isLoaded) return;
    this.isLoaded = true;
    
    ['Gloomhaven', 'JOTL'].forEach((game) => {
      const cards = YAML.load(`assets/${game.toLowerCase()}/abilities.yml`);

      cards.forEach((card) => {
        if (['three-swords'].includes(card.char)) {
          card.requireExact = true;
        }

        card.level = card.level.toString().toLowerCase();
        card.longImage = `assets/${game.toLowerCase()}/images/characters/${card.char}/${card.image}`;

        this.gloomAbilities.add(Object.assign({ _key: card.name }, card));
        this.gloomAbilities.add(Object.assign({ _key: `${card.name} ${card.char}` }, card));
        this.gloomAbilities.add(Object.assign({ _key: `${card.name} ${card.level}` }, card));
        this.gloomAbilities.add(Object.assign({ _key: `${card.char} ${card.name}` }, card));
        this.gloomAbilities.add(Object.assign({ _key: `${game.toLowerCase()} ${card.name}` }, card));
        this.gloomAbilities.add(Object.assign({ _key: `${card.name} ${game.toLowerCase()}` }, card));
        this.gloomCards.push(card);
      });
    });
  }

}

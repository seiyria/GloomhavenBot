import { AutoWired, Singleton } from 'typescript-ioc';
import * as YAML from 'yamljs';
import { FuzzySetContainer } from 'fuzzyset-obj';

import { BaseService } from '../base/BaseService';
import { Game } from '../interfaces/IGame';

interface IItem {
  name: string;
  num: number;
  image: string;
  longImage: string;
  source: string;
  isSpoiler: boolean;
  game: Game;
}

@Singleton
@AutoWired
export class ItemService extends BaseService {

  private items: FuzzySetContainer<IItem> = new FuzzySetContainer<IItem>({ key: '_key' });

  public async init(client) {
    super.init(client);

    this.loadAll();
  }

  public getItem(name: string): IItem {
    try {
      return this.items.getFirst(name);
    } catch {
      return null;
    }
  }

  private loadAll() {
    ['Gloomhaven', 'JOTL'].forEach((game) => {
      const cards = YAML.load(`assets/${game.toLowerCase()}/items.yml`);

      cards.forEach((card) => {
        card.longImage = `assets/${game.toLowerCase()}/images/items/${card.image}`;
        card.game = game;

        if (game === 'Gloomhaven' && card.source !== 'Prosperity 1') { card.isSpoiler = true; }
        if (game === 'JOTL') { card.isSpoiler = true; }

        const itemNum = `#${card.num.toString().padStart(3, '0')}`;

        this.items.add(Object.assign({ _key: card.name }, card));
        this.items.add(Object.assign({ _key: `${game.toLowerCase()} ${card.name}` }, card));
        this.items.add(Object.assign({ _key: `${card.name} ${game.toLowerCase()}` }, card));
        this.items.add(Object.assign({ _key: `${game.toLowerCase()} ${itemNum}` }, card));
        this.items.add(Object.assign({ _key: `${itemNum} ${game.toLowerCase()}` }, card));
      });
    });
  }

}

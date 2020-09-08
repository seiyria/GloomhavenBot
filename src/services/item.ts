import { AutoWired, Singleton } from 'typescript-ioc';
import * as YAML from 'yamljs';
import { FuzzySetContainer } from 'fuzzyset-obj';

import { BaseService } from '../base/BaseService';

interface IItem {
  name: string;
  num: number;
  image: string;
  longImage: string;
  source: string;
  isSpoiler: boolean;
}

@Singleton
@AutoWired
export class ItemService extends BaseService {

  private gloomItems: FuzzySetContainer<IItem> = new FuzzySetContainer<IItem>({ key: '_key' });

  public async init(client) {
    super.init(client);

    this.loadAll();
  }

  public getGloomItem(name: string): IItem {
    try {
      return this.gloomItems.getFirst(name);
    } catch {
      return null;
    }
  }

  private loadAll() {
    this.loadGloomItems();
  }

  private loadGloomItems() {
    const cards = YAML.load('assets/gloomhaven/items.yml');

    cards.forEach((card) => {

      card.longImage = `assets/gloomhaven/images/items/${card.image}`;
      if (card.source !== 'Prosperity 1') { card.isSpoiler = true; }

      const nameRef = Object.assign({ _key: card.name }, card);
      const idRef = Object.assign({ _key: `#${card.num.toString().padStart(3, '0')}` }, card);

      this.gloomItems.add(nameRef);
      this.gloomItems.add(idRef);
    });
  }

}

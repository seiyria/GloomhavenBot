import { AutoWired, Singleton } from 'typescript-ioc';
import * as YAML from 'yamljs';
import * as fs from 'fs';
import { FuzzySetContainer } from 'fuzzyset-obj';

import { BaseService } from '../base/BaseService';
import { Game } from '../interfaces/IGame';

interface IFAQ {
  icon: string;
  query: string;
  results: Array<{ title: string, content: string }>;
  game: Game;
}

@Singleton
@AutoWired
export class FAQService extends BaseService {

  private faqs: FuzzySetContainer<IFAQ> = new FuzzySetContainer<IFAQ>({ key: '_key' });

  public async init(client) {
    super.init(client);

    this.loadAll();
  }

  public getFAQ(name: string): IFAQ {
    try {
      return this.faqs.getFirst(name);
    } catch {
      return null;
    }
  }

  private loadAll() {
    ['Gloomhaven', 'Custom'].forEach((game) => {
      if(!fs.existsSync(`assets/${game.toLowerCase()}/faq.yml`)) return;

      const faqs = YAML.load(`assets/${game.toLowerCase()}/faq.yml`) || [];

      faqs.forEach((faq) => {
        this.faqs.add({ _key: faq.search, query: faq.search, results: faq.results, icon: faq.icon, game });
      });
    });
  }
}

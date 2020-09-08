
import { AutoWired, Inject, Singleton } from 'typescript-ioc';
import { BaseService } from '../base/BaseService';
import { EmojiService } from './emoji';

@Singleton
@AutoWired
export class TextParserService extends BaseService {

  @Inject private emojiService: EmojiService;

  public async init(client) {
    super.init(client);
  }

  public formatTextForEmojis(text: string): string {
    const matches = text.match(/<emoji>:([a-zA-Z0-9_])+/g);
    if (!matches || !matches[0]) { return text; }

    matches.forEach((match) => {
      const [_, replace] = match.split(':');
      text = text.replace(match, this.emojiService.getEmoji(replace));
    });

    return text;
  }

}

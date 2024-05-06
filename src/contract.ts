// Find all our documentation at https://docs.near.org
import { NearBindgen, near, call, view } from 'near-sdk-js';

@NearBindgen({})
class HelloNear {
  greeting: string = 'Hello';

  @view({}) // This method is read-only and can be called for free
  get_greetingz(): string {
    return this.greeting;
  }

  @call({}) // This method changes the state, for which it cost gas
  set_greetingm({ greeting }: { greeting: string }): void {
    near.log(`Saving greeting ${greeting}`);
    this.greeting = greeting;
  }
}
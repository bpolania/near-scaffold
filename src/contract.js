// Find all our documentation at https://docs.near.org
import { NearBindgen, near, call, view } from 'near-sdk-js';

@NearBindgen({})
class HelloNear {
  greeting  = 'Hello';

  @view({}) // This method is read-only and can be called for free
  get_greetingm() {
    return this.greeting;
  }

  @call({}) // This method changes the state, for which it cost gas
  set_greetingm({ greeting }) {
    near.log(`Saving greeting ${greeting}`);
    this.greeting = greeting;
  }
}
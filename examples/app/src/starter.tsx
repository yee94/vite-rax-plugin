import Rax, { render } from 'rax';
import Page from './pages/Home';
import * as DriverDom from 'driver-dom';

render(<Page />, document.querySelector('#app')!, {
  driver: DriverDom,
});

document.querySelector('#app')?.setAttribute('style', '');

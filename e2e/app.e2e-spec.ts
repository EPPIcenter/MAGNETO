import { MagnetoJsPage } from './app.po';

describe('magneto-js App', () => {
  let page: MagnetoJsPage;

  beforeEach(() => {
    page = new MagnetoJsPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

const mountApp = require('./mountApp');
const pageModel = require('./pageModel');

describe('Viewing the home page', () => {
  it('shows me the content', () => {
    mountApp();
    return pageModel.homeTab().shouldHave({text: 'Hyperdom Boilerplate'});
  });
})

describe('Viewing the contact', () => {
  it('lists my contacts', () => {
    const contactsTab = pageModel.contactsTab;
    mountApp();
    return pageModel.navigation.contactsLink().click().then(() => {
      return Promise.all([
        contactsTab.contact('Jimmy').shouldExist(),
        contactsTab.contact('Robert').shouldExist(),
        contactsTab.contact('John').shouldExist(),
        contactsTab.contact('John Paul').shouldExist(),
      ])
    });
  });
});


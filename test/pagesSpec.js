const mountApp = require('./mountApp');
const pageModel = require('./pageModel');

describe('Viewing the home page', () => {
  it('shows me the content', () => {
    mountApp();
    return pageModel.homeTab().shouldHave({text: 'Hyperdom Boilerplate'});
  });
})


describe('Viewing the contacts', () => {
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


describe('adding contacts', () => {
  it('lets me add a contact', () => {
    mountApp();
    return pageModel.navigation.contactsLink().click().then(() => {
      return pageModel.contactsTab.newContact().typeIn('Stan');
    }).then(() => {
      return pageModel.contactsTab.addContact().submit();
    }).then(() => {
      return pageModel.contactsTab.contact('Stan').shouldExist();
    })
  })

  it('won`t add a contact if there`s no name', () => {
    mountApp();
    return pageModel.navigation.contactsLink().click().then(() => {
      return pageModel.contactsTab.addContact().submit()
    }).then(() => {
      return pageModel.contactsTab.addContactError().shouldHave({ text: 'Enter a name' });
    }).then(() => {
      return pageModel.contactsTab.contact('').shouldNotExist();
    })
  });
})

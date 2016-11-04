const browser = require('browser-monkey');

browser.set({
  visibleOnly: false,
  document: window.document,
  timeout: 10000
});

module.exports = browser.component({
  navigation: browser.find('nav').component({
    homeLink: function() { return this.find('.homeLink') },
    contactsLink: function() { return this.find('.contactsLink') },
  }),
  homeTab: function() { return browser.find('.homeTab') },
  contactsTab: browser.find('.contactsTab').component({
    contact: function(name) {
      return this.find('.contactsList-contact', {exactText: name})
    },
    newContact: function() {
      return this.find('.newContact');
    },
    addContact: function() {
      return this.find('.addContact');
    },
    addContactError: function() {
      return this.find('.addContact-error');
    }
  })
})

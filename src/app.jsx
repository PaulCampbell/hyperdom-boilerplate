/** @jsx hyperdom.jsx */
const hyperdom = require('hyperdom');
const router = require('hyperdom-router');

const routes = {
  home:  router.route('/'),
  contacts: router.route('/contacts'),
};

class App {
  constructor() {
    router.start({history: router.hash});
    this.contacts = [
      { name: 'Jimmy' },
      { name: 'Robert' },
      { name: 'John Paul' },
      { name: 'John' },
    ]
  }

  renderHome() {
    return <div class='homeTab'>
      <h1>Hyperdom Boilerplate</h1>
      <p>Now then</p>
    </div>
  }

  renderContacts() {
    return <div class='contactsTab'>
      <h1>Contacts</h1>
      <ul class='contactsList'>
      {
        this.contacts.map((c) => {
          return <li class='contactsList-contact'>{ c.name }</li>
        })
      }
      </ul>
    </div>
  }

  render() {
    return <div>
      <nav>
        <ul>
          <li> { routes.home().link({ class: 'homeLink'}, 'Home') } </li>
          <li> { routes.contacts().link({ class: 'contactsLink'}, 'Contacts') } </li>
        </ul>
      </nav>
      { routes.home(() => { return this.renderHome(); }) }
      { routes.contacts(() => { return this.renderContacts(); }) }
    </div>
  }
}

module.exports = App;


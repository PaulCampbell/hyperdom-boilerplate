/** @jsx hyperdom.jsx */
const hyperdom = require('hyperdom');

const tabs =  [
  { name: 'Home', renderMethod: 'renderHome', id: 'home' },
  { name: 'Contacts', renderMethod: 'renderContacts', id: 'contacts' }
]

class App {
  constructor() {
    this.currentTab = this.findTabById('home');
    this.contacts = [
      { name: 'Jimmy' },
      { name: 'Robert' },
      { name: 'John Paul' },
      { name: 'John' },
    ]
  }

  setTab(tabId) {
    this.currentTab = this.findTabById(tabId);
    history.pushState({ tab: tabId }, this.currentTab.title, `/${tabId}`);
  }

  findTabById(tabId) {
    return tabs.filter((tab) => tab.id === tabId)[0]
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
      { this.contacts.map((c) => {
          return <li class='contactsList-contact'>{ c.name }</li>
        })
      }
      </ul>
    </div>
  }

  renderPage(currentTab) {
    return <div>
      { this[currentTab.renderMethod]() }
    </div>
  }

  render() {
    return <div>
      <nav>
        <ul>
          <li><a class='homeLink' href="#" onclick={(ev)=> { ev.preventDefault(); this.setTab('home'); }}>Home</a></li>
          <li><a class='contactsLink' href="#" onclick={(ev)=> { ev.preventDefault(); this.setTab('contacts'); }}>Contacts</a></li>
        </ul>
      </nav>
      { this.renderPage(this.currentTab) }
    </div>
  }
}

module.exports = App;


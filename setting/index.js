import { gettext } from 'i18n'

AppSettingsPage({
  state: {
    UserName: "",
    Password: "",
    props: {},
  },
  setState(props) {
  this.state.props = props;
  // Load saved username and password
  this.state.username = props.settingsStorage.getItem('UserName') || "";
  this.state.password = props.settingsStorage.getItem('Password') || "";
  },
  saveCredentials() {
  this.state.props.settingsStorage.setItem('UserName', this.state.username);
  this.state.props.settingsStorage.setItem('Password', this.state.password);
  // Optionally show a success message
  console.log("Credentials saved!");
  },
  
  build(props) {
  this.setState(props);
  return View(
    { style: { padding: '12px 20px' } },
    [
      // Username input
      TextInput({
        label: "Habitica username or email",
        value: this.state.username,
        onChange: (val) => {
          this.state.username = val;
        }
      }),
      // Password input
      TextInput({
        label: "Password",
        value: this.state.password,
        onChange: (val) => {
          this.state.password = val;
        }
      }),
      // Save button
      Button({
        label: "Save",
        onClick: () => this.saveCredentials()
      })
    ]
  )
}})
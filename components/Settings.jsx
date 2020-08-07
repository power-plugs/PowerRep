const { React, getModuleByDisplayName } = require('powercord/webpack');
const { TextInput } = require('powercord/components/settings');
const { Card, AsyncComponent } = require('powercord/components');
const FormText = AsyncComponent.from(getModuleByDisplayName('FormText'));

module.exports = class Settings extends React.Component {
    constructor(props) {
        super();
    }

    render() {
        return (
            <div>
                <TextInput
                    autoCorrect="off"
                    value={this.props.getSetting("apikey", "")}
                    onChange={val => this.props.updateSetting("apikey", val)}
                    readonly={true}
                >
                    API key
                </TextInput>
                <Card style={{"padding":"18px"}}>
                    <FormText>
                        Feel free to check out some of my other plugins on <a href="https://github.com/power-plugs?tab=repositories" target="_BLANK">GitHub</a>!
                    </FormText>
                </Card>
            </div>
        );
    }
};
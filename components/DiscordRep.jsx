const { React, getModule, i18n: { Messages }, getModuleByDisplayName } = require('powercord/webpack');
const { Spinner, Text, Flex } = require('powercord/components');
const AsyncComponent = require('powercord/components/AsyncComponent');

const FormSection = AsyncComponent.from(getModuleByDisplayName('FormSection'));

class Section extends React.PureComponent {
  constructor(props) {
    super(props);

    this.classes = {
      ...getModule(['marginBottom8'], false),
    };
  }

  render() {
    const { children, title } = this.props;

    if (!children) return null;

    return (
      <FormSection
        className={this.classes.marginBottom8 + ' rep-section'}
        tag='h5'
        title={title}
      >
        <Text selectable={true}>{children}</Text>
      </FormSection>
    );
  }
}

module.exports = class DiscordRep extends React.PureComponent {
  constructor(props) {
    super(props);

    this.classes = {
      empty: getModule(['body', 'empty'], false).empty,
      nelly: getModule(['flexWrapper', 'image'], false).image,
      ...getModule(['emptyIcon'], false),
    };

    this.state = {
      streamerMode: getModule(['hidePersonalInformation'], false)
        .hidePersonalInformation,
    };
  }

  async componentDidMount() {
    const { fetchRep, id } = this.props;

    try {
      const rep = await fetchRep(id);
      this.setState({ rep });
    } catch (e) {
      switch (e.statusCode) {
        case 401: {
          this.setState({
            error: {
              message:
                'Unauthorized. Maybe you mistyped or didn\'t set your API key?',
            },
          });
          break;
        }
        case 429: {
          this.setState({
            error: {
              message:
                'Woah there buddy! You hit the rate limit. Maybe… try slowing down?',
            },
          });
          break;
        }
        default: {
          this.setState({
            error: {
              message: `An unknown error occurred. Maybe try again later? (${e.statusCode})`,
            },
          });
          break;
        }
      }
    }
  }

  render() {
    const moment = getModule(['momentProperties'], false);
    const { rep, error, streamerMode } = this.state;

    if (streamerMode) {
      return (
        <div className={this.classes.empty}>
          <div className={this.classes.emptyIconStreamerMode} />
          <div className={this.classes.emptyText}>
            {Messages.STREAMER_MODE_ENABLED}
          </div>
        </div>
      );
    } else if (error) {
      const { message, icon } = error;

      return (
        <div className={this.classes.empty}>
          <div className={(icon || this.classes.nelly) + ' error-icon'} />
          <div className={this.classes.emptyText}>{message}</div>
        </div>
      );
    } else if (!rep) {
      return (
        <div className={this.classes.empty}>
          <Spinner />
        </div>
      );
    } else {
      const {
        id,
        xp,
        rank,
        staff,
        upvotes,
        downvotes,
      } = rep;

      /* <dumbcode> */
      let uv = 0;
      if(upvotes == 0 && downvotes == 0)
        uv = 0;
      else if(downvotes == 0)
        uv = upvotes;
      else
        uv = (upvotes/downvotes).toFixed(2);
      /* </dumbcode> */

      return (
        <div className='discordrep' fade={true}>
          <Flex justify={Flex.Justify.START} wrap={Flex.Wrap.WRAP}>
            <Section title='Staff'>{staff ? "Yes" : "No"}</Section>
            <Section title='XP'>{xp.toString()}</Section>
            <Section title='Rank'>{rank}</Section>
            <Section title='Upvotes'>{upvotes.toString()}</Section>
            <Section title='Downvotes'>{downvotes.toString()}</Section>
            <Section title='Up/Down'>{uv == NaN ? "0" : uv.toString()}</Section>
          </Flex>
        </div>
      );
    }
  }
};

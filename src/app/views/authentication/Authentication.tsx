import hello from 'hellojs';
import { PrimaryButton } from 'office-ui-fabric-react';
import React, { Component } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { IAuthenticationProps, IAuthenticationState } from '../../../types/authentication';
import * as authActionCreators from '../../services/actions/auth-action-creators';
import * as queryActionCreators from '../../services/actions/query-action-creators';
import { ADMIN_AUTH_URL, AUTH_URL, DEFAULT_USER_SCOPES , TOKEN_URL, USER_INFO_URL } from '../../services/constants';
import './authentication.scss';

export class Authentication extends Component<IAuthenticationProps,  IAuthenticationState> {
  public state = {
    authenticated: {
      status: false,
      user: {
        displayName: '',
        emailAddress: '',
      },
      token: '',
    },
  };

  public signIn = () => {
    const { actions, queryActions } = this.props;
    hello.init({
      msft: {
        oauth: {
          version: 2,
          auth: AUTH_URL,
          grant: TOKEN_URL,
        },
        scope_delim: ' ',
        form: false,
      },
      msft_admin_consent: {
        oauth: {
          version: 2,
          auth: ADMIN_AUTH_URL,
          grant: TOKEN_URL,
        },
        scope_delim: ' ',
        form: false,
      },
    } as any);
    hello.init(
      {
        msft: 'cb2d7367-7429-41c6-ab18-6ecb336139a6',
        msft_admin_consent: 'cb2d7367-7429-41c6-ab18-6ecb336139a6',
      },
      {
        redirect_uri: window.location.pathname,
      },
    );
    hello('msft').login({
        response_type: 'token',
        scope: DEFAULT_USER_SCOPES,
        display: 'popup',
      });
    hello.on('auth.login', async (auth) => {
        let accessToken;
        const authenticated = {...this.state.authenticated};
        if (auth.network === 'msft') {
          const authResponse = hello('msft').getAuthResponse();
          accessToken = authResponse.access_token;
          if (accessToken) {
            authenticated.token = accessToken;
          }
          authenticated.status = true;
        }
        if (accessToken) {
          try {
            const userInfo = (queryActions) ? await queryActions.runQuery(USER_INFO_URL) : null;
            const jsonUserInfo = userInfo.response.body;
            authenticated.user = {...{},
                                  displayName: jsonUserInfo.displayName,
                                  emailAddress: jsonUserInfo.mail || jsonUserInfo.userPrincipalName,
            };
            if (actions) {
              actions.authenticateUser(authenticated);
              this.setState({
                authenticated,
              });
            }
          } catch (e) {
            // tslint:disable-next-line:no-console
            console.log(e);
          }
        }
      });
  };

  public render() {
    const { authenticated } = this.state;
    return (
      <div className='authentication-container'>
        <PrimaryButton onClick={this.signIn} className='signIn-button'>
          Sign In
        </PrimaryButton>
        <div className='authentication-details'>
          <span className='user-name'>{authenticated.user.displayName}</span>
          <br />
          <span className='user-email'>{authenticated.user.emailAddress}</span>
        </div>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch: Dispatch): object {
  return {
    actions: bindActionCreators(authActionCreators, dispatch),
    queryActions: bindActionCreators(queryActionCreators, dispatch),
  };
}

function mapStateToProps(state: IAuthenticationState) {
  return {
    authenticated: state.authenticated,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Authentication);

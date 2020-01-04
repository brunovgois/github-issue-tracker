import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';
import { IssueList, Loading, Owner, StateFilter } from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    selectedRadio: 'all',
  };

  async componentDidMount() {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'open',
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  //TODO bug
  handleRadioChange = async (e) => {
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);

    this.setState({ selectedRadio: e.target.name });
    const issueState = e.target.name;

    console.log(issueState);

    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: issueState,
        per_page: 5,
      }
    });

    this.setState({
      issues: issues.data,
    })

    // console.log('state depois: ');
    // console.log(this.state.issues);
  };

  render() {
    const { repository, issues, loading } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }
    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <StateFilter>
          {/*TODO style it better */}
          <label>
            <input
              type="radio"
              checked={this.state.selectedRadio === 'all'}
              value="all"
              name="all"
              onChange={this.handleRadioChange}
            ></input>
            All
          </label>

          <label>
            <input
              type="radio"
              checked={this.state.selectedRadio === 'open'}
              value="open"
              name="open"
              onChange={this.handleRadioChange}
            ></input>
            Open
          </label>

          <label>
            <input
              type="radio"
              checked={this.state.selectedRadio === 'closed'}
              value="closed"
              name="closed"
              onChange={this.handleRadioChange}
            ></input>
            Closed
          </label>
        </StateFilter>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}

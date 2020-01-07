import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import Container from '../../components/Container';
import { IssueList, Loading, Owner, StateFilter, Pagination } from './styles';

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
    disablePaginationBtn: true,
    currentPage: 1
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

  handleRadioChange = async (e) => {
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);

    this.setState({ selectedRadio: e.target.name });
    const issueState = e.target.name;

    //TODO duplicated code
    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: issueState,
        per_page: 5,
        page: this.state.currentPage,
      },
    });

    this.setState({
      issues: issues.data,
    });

  };

  handlePagination = async pages => {
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);

    if(pages === 'right') {
      this.setState({disablePaginationBtn: false});
      this.setState(prevState => {
        return {currentPage: prevState.currentPage + 1}
      })
    }
    else{
      if(this.state.currentPage === 1)
        this.setState({disablePaginationBtn: true});

      this.setState(prevState => {
        return {currentPage: prevState.currentPage - 1}
      })
    }

    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: this.state.selectedRadio,
        per_page: 5,
        page: this.state.currentPage,
      }
    });

   this.setState({
      issues: issues.data,
    });
  }

  render() {
    const { repository, issues, loading, disablePaginationBtn } = this.state;

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
        <Pagination disablePaginationBtn={disablePaginationBtn}>
          <button onClick={() => this.handlePagination('left')}><FaArrowLeft /> </button>
          <button onClick={() => this.handlePagination('right')}><FaArrowRight /> </button>
        </Pagination>
      </Container>
    );
  }
}

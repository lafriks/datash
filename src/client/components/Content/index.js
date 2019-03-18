import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import './index.css';
import Header from '../Header';
import ControlPanel from '../ControlPanel';
import Footer from '../Footer';
import About from '../About';
import NotFound from '../NotFound';
import Feedback from '../Feedback';

class Content extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const {
      selectedTabKey, onSelectTab, receivedData, onDeleteReceivedData
    } = this.props;

    return (
      <div className="content">
        <Header />
        <div className="main-content">
          <Switch>
            <Route
              exact
              path="/"
              render={props => (
                <ControlPanel
                  {...props}
                  selectedTabKey={selectedTabKey}
                  onTabChange={onSelectTab}
                  receivedData={receivedData}
                  onDeleteReceivedData={onDeleteReceivedData}
                />
              )}
            />
            <Route exact path="/about" component={About} />
            <Route exact path="/feedback" component={Feedback} />
            <Route component={NotFound} />
          </Switch>
        </div>
        <Footer />
      </div>
    );
  }
}

Content.propTypes = {
  receivedData: PropTypes.instanceOf(Array).isRequired,
  onDeleteReceivedData: PropTypes.func.isRequired,
  selectedTabKey: PropTypes.string.isRequired,
  onSelectTab: PropTypes.func.isRequired
};

export default Content;

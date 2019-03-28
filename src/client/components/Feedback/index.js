import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
  Rate, Input, Button, message
} from 'antd';
import './index.css';
import globalStates from '../../global-states';

const { TextArea } = Input;
const ratingLabels = ['Terrible', 'Bad', 'Normal', 'Good', 'Wonderful'];

class Feedback extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ratingValue: 3,
      textAreaVal: '',
      submittingFeedback: false
    };

    this.onChangeRatingVal = this.onChangeRatingVal.bind(this);
    this.onChangeTextAreaVal = this.onChangeTextAreaVal.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChangeRatingVal(value) {
    this.setState({ ratingValue: value });
  }

  onChangeTextAreaVal(evt) {
    this.setState({
      textAreaVal: evt.target.value
    });
  }

  onSubmit() {
    const { ratingValue, textAreaVal } = this.state;
    const { history } = this.props;

    this.setState({
      submittingFeedback: true
    });

    const payload = {
      rating: ratingValue,
      ratingLabel: ratingLabels[ratingValue - 1],
      suggestions: textAreaVal,
      userAgent: navigator.userAgent,
      clientId: globalStates.clientId
    };

    axios.post('/api/v1/feedback', payload)
      .then(() => {
        message.success('Thanks for your feedback!');
        this.setState({
          submittingFeedback: false
        });
        history.push('/');
      })
      .catch((err) => {
        message.error(err.message || String(err));
        this.setState({
          submittingFeedback: false
        });
      });
  }

  render() {
    const { ratingValue, textAreaVal, submittingFeedback } = this.state;

    return (
      <div className="feedback">
        <div className="feedback-wrapper">
          <div>
            <h2>How did you feel about the application?</h2>
            <div>
              <Rate tooltips={ratingLabels} onChange={this.onChangeRatingVal} value={ratingValue} />
              <span className="ant-rate-text">{ratingLabels[ratingValue - 1]}</span>
            </div>
          </div>
          <div>
            <h2>How could I improve this service?</h2>
            <TextArea
              rows="7"
              value={textAreaVal}
              className="input-textarea"
              autosize={false}
              placeholder="Write down your suggestions if any"
              onChange={this.onChangeTextAreaVal}
            />
            <div style={{ textAlign: 'right' }}>
              <Button
                loading={submittingFeedback}
                className="btn-submit"
                type="primary"
                onClick={this.onSubmit}
              >
              Submit Feedback
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Feedback.propTypes = {
  history: PropTypes.instanceOf(Object).isRequired,
};

export default Feedback;

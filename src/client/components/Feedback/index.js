import React from 'react';
import { Rate, Input, Button } from 'antd';
import './index.css';

const { TextArea } = Input;
const ratingLabel = ['Terrible', 'Bad', 'Normal', 'Good', 'Wonderful'];

class Feedback extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ratingValue: 3,
      textAreaVal: ''
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

  }

  render() {
    const { ratingValue, textAreaVal } = this.state;

    return (
      <div className="feedback">
        <div className="feedback-wrapper">
          <div>
            <h2>How did you feel about the application?</h2>
            <div>
              <Rate tooltips={ratingLabel} onChange={this.onChangeRatingVal} value={ratingValue} />
              <span className="ant-rate-text">{ratingLabel[ratingValue - 1]}</span>
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

export default Feedback;

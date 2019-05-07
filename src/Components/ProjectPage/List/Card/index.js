import React, { Component } from 'react';
import './index.scss';

export default class Card extends Component {
    constructor(props) {
        super();
        this.state = {
            text: props.text
        }
    }

    render() {
        const { text } = this.props;

        return (
            <div className='card'>{text}</div>
        )
    }
}
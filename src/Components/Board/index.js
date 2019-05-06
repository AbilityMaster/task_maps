import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import LocalStorage from '../localStorage';
import projectInfo from '../../../package.json';
import './index.scss';

export default class Board extends Component {
    constructor(props) {
        super();
        this.localStorage = new LocalStorage(projectInfo.version, projectInfo.name);
        const dataLS = this.localStorage.dataset;
        this.state = {
            isAddedToFavourite: dataLS.find((element, index) => ( dataLS[index].id === props.id )).isAddedToFavourite
        }
    }

    getLink = () => {
        const { id, name } = this.props;
        const tempArr = name.split('');

        if (name.indexOf(' ') !== -1) {
            tempArr[name.indexOf(' ')] = '-';
        }

        return `/b/${id}/${tempArr.join('')}`;
    }

    addToFavourite = () => {
        const { id, sendToFavourite } = this.props;
        const LC = this.localStorage.dataset;        

        for (let i = 0; i < LC.length; i++) {
            if (LC[i].id === id) {
                LC[i].isAddedToFavourite ? LC[i].isAddedToFavourite = false : LC[i].isAddedToFavourite = true;
                this.state.isAddedToFavourite ?  this.setState({ isAddedToFavourite: false }) : this.setState({ isAddedToFavourite: true })
            }
        }

        this.localStorage.dataset = LC;
        sendToFavourite(LC);
    }

    get classNames() {
        const { isAddedToFavourite } = this.state;
        const classNames = ['board__favourite-button'];

        if (isAddedToFavourite) {
            classNames.push('board__favourite-button_favourite');
        }

        return classNames.join(' ');
    }

    render() {
        const { className, text, name, background } = this.props;

        return (
            <div onClick={this.addTime} className={className} style={{background: background}}>
                <div className='board__name'>{name}</div>
                <div className='board__button'></div>
                <div className='board__add-new'>{text}</div>
                <div onClick={this.addToFavourite} className={this.classNames}>★</div>
                <Link to={this.getLink()} />
            </div>
        )
    }
}
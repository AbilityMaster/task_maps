import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import LocalStorage from '../localStorage';
import projectInfo from '../../../package.json';
import './index.scss';

export default class Board extends Component {
    constructor(props) {
        super();
        this.localStorage = new LocalStorage(projectInfo.version, projectInfo.name);
        const id = props.id;
        const dataLS = this.localStorage.dataset;
        this.state = {
            isFavourite: dataLS.find(element => ( element.id === id )).isFavourite
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
                LC[i].isFavourite ? LC[i].isFavourite = false : LC[i].isFavourite = true;
                this.state.isFavourite ?  this.setState({ isFavourite: false }) : this.setState({ isFavourite: true })
            }
        }

        this.localStorage.dataset = LC;
        sendToFavourite(LC);
    }

    get classNames() {
        const { isFavourite } = this.state;
        const classNames = ['board__favourite-button'];

        if (isFavourite) {
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
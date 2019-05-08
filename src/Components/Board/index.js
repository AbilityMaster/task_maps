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
        const id = props.id;
        this.state = {
            isFavourite: this.getIsFavourite(dataLS, id)
        }
    }

    getIsFavourite = (dataLS, id) => {
        const project = dataLS.find(element => ( element.id === id ));
        
        return project.isFavourite ? project.isFavourite : false;
    }

    getLink = () => {
        const { id, name } = this.props;
        const nameSplit = name.split('');

        if (name.indexOf(' ') !== -1) {
            nameSplit[name.indexOf(' ')] = '-';
        }

        return `/b/${id}/${nameSplit.join('')}`;
    }

    addToFavourite = () => {
        const { id, sendToFavourite } = this.props;
        const dataLS = this.localStorage.dataset;        

        for (let i = 0; i < dataLS.length; i++) {
            if (dataLS[i].id === id) {
                dataLS[i].isFavourite ? dataLS[i].isFavourite = false : dataLS[i].isFavourite = true;
                this.state.isFavourite ?  this.setState({ isFavourite: false }) : this.setState({ isFavourite: true })
            }
        }

        this.localStorage.dataset = dataLS;
        sendToFavourite(dataLS);
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
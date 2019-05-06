import React, { Component } from 'react';
import './index.scss';

export default class List extends Component {
    constructor() {
        super();
        this.state = {
            isVisibleAddCardForm: false
        }
    }

    cardAdd = () => {
        const { isVisibleAddCardForm } = this.state;

        if (isVisibleAddCardForm) {
            return;
        }

        this.setState({
            isVisibleAddCardForm: true
        });
    }

    closeCardAdd = () => {
        this.setState({
            isVisibleAddCardForm: false
        });
    }

    addCardToList = () => {
        console.log('+');
    }

    get classNames() {
        const { isVisibleAddCardForm } = this.state;
        const classNames = {
            list: ['list'],
            addCard: ['list__add-card'],
            addCardForm: ['list__form'],
        }

        if (isVisibleAddCardForm) {
            classNames.addCard.push('list__add-card_hidden');
            classNames.list.push('list_open');
        } else {
            classNames.list.push('list_close');
            classNames.addCardForm.push('list__form_hidden');
        }

        return {
            list: classNames.list.join(' '),
            addCard: classNames.addCard.join(' '),
            addCardForm: classNames.addCardForm.join(' ')
        }
    }

    render() {
        const { header } = this.props;

        return (
            <div className='list-wrapper'>
                <div onClick={this.openAddHeaderForm} className={this.classNames.list}>
                    <div className='list__header'>{header}</div>
                    <div onClick={this.cardAdd} className={this.classNames.addCard}>+ Добавить карточку</div>
                    <div className={this.classNames.addCardForm}>
                        <textarea className='list__textarea' defaultValue='Ввести заголовок для этой карточки'></textarea>
                        <button onClick={this.addCardToList} className='add-list__button add-list__button_allowToPress'>Добавить карточку</button>
                        <div onClick={this.closeCardAdd} className='list__close'>✕</div>
                    </div>
                </div>
            </div>
        )
    }
}
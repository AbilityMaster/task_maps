import React, { Component } from 'react';
import nanoid from 'nanoid';
import { MIN_HEIGHT_TEXTAREA_LIST, MAX_HEIGHT_TEXTAREA_LIST, STEP_HEIGHT_AUTOSIZE_TEXTAREA_LIST } from '../../const';
import Card from './Card';
import './index.scss';

export default class List extends Component {
    constructor(props) {
        super();
        this.localStorage = props.localStorage;
        this.state = {
            listName: props.header,
            isVisibleAddCardForm: false,
            isVisibleTextareaList: false,
            cards: this.getCards(props)
        }
        this.textareaNameList = React.createRef();
        this.hiddenTextAreaNameList = React.createRef();
        this.textareaCard = React.createRef();
    }

    getCards = (props) => {
        const projectId = props.projectId;
        const listId = props.listId;
        const dataLS = this.localStorage.dataset;

        const project = dataLS.find(element => (element.id === projectId));
        const lists = project ? project.lists.find(element => (element.id === listId)) : '';

        return lists.cards || [];
    }

    cardAdd = () => {
        const { isVisibleAddCardForm } = this.state;

        if (isVisibleAddCardForm) {
            return;
        }

        this.setState({
            isVisibleAddCardForm: true
        }, () => {
            this.textareaCard.current.value = '';
            this.textareaCard.current.focus();
        });
    }

    closeCardAdd = () => {
        this.setState({
            isVisibleAddCardForm: false
        });
    }

    addCardToList = () => {
        const { cards } = this.state;
        const projectId = this.props.projectId;
        const listId = this.props.listId;
        const dataLS = this.localStorage.dataset;

        const project = dataLS.find(element => (element.id === projectId));
        const projectIndex = dataLS.findIndex(element => (element.id === projectId));
        const list = project ? project.lists.find(element => (element.id === listId)) : '';
        const listIndex = project ? project.lists.find(element => (element.id === listId)) : 0;

        cards.push({
            id: nanoid(4),
            text: this.textareaCard.current.value
        });

        list.cards = cards;

        dataLS[projectIndex].lists[listIndex] = cards;
        this.localStorage.dataset = dataLS;

        this.setState({
            cards
        }, () => {
            this.textareaCard.current.value = '';
            this.textareaCard.current.focus();
        });
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClickOutside, false);
    }

    changeNameList = () => {
        this.setState(prevState => ({
            isVisibleTextareaList: !prevState.isVisibleTextareaList,
        }), () => {
            if (this.textareaNameList.current) {
                this.resizeArea();
                this.textareaNameList.current.focus();
                this.textareaNameList.current.select();
            }
        });
    }

    handleClickOutside = () => {
        const dataLS = this.localStorage.dataset;
        const id = this.props.projectId;
        const listId = this.props.listId;
        const listName = this.textareaNameList.current.value;

        for (let i = 0; i < dataLS.length; i++) {
            if (dataLS[i].id === id) {
                let index = dataLS[i].lists.findIndex(element => (element.id === listId));

                if (index !== -1) {
                    dataLS[i].lists[index].header = dataLS[i].lists[index].header ? dataLS[i].lists[index].header = listName : '';
                }
            }
        }

        this.setState({
            listName
        });

        this.localStorage.dataset = dataLS;
        this.changeNameList();
    };

    get classNames() {
        const { isVisibleAddCardForm, isVisibleTextareaList } = this.state;
        const classNames = {
            list: ['list'],
            addCard: ['list__add-card'],
            addCardForm: ['list__form'],
            listHeader: ['list__header-value'],
            listTextareaHeader: ['list__header-textarea'],
            hiddenlistHeader: ['list__header-textarea_hidden']
        }

        if (isVisibleAddCardForm) {
            classNames.addCard.push('list__add-card_hidden');
            classNames.list.push('list_open');
        } else {
            classNames.list.push('list_close');
            classNames.addCardForm.push('list__form_hidden');
        }

        if (isVisibleTextareaList) {
            classNames.listHeader.push('list__header-value_hidden');
            classNames.hiddenlistHeader.push('list__header-textarea_hidden_visible');
            classNames.listTextareaHeader.push('list__header-textarea_visible');
        }

        return {
            list: classNames.list.join(' '),
            addCard: classNames.addCard.join(' '),
            addCardForm: classNames.addCardForm.join(' '),
            listHeader: classNames.listHeader.join(' '),
            listTextareaHeader: classNames.listTextareaHeader.join(' '),
            hiddenlistHeader: classNames.hiddenlistHeader.join(' ')
        }
    }

    resizeArea = () => {
        this.hiddenTextAreaNameList.current.innerHTML = this.textareaNameList.current.value;

        let height = this.hiddenTextAreaNameList.current.offsetHeight + STEP_HEIGHT_AUTOSIZE_TEXTAREA_LIST;

        height = Math.max(MIN_HEIGHT_TEXTAREA_LIST, height);
        height = Math.min(MAX_HEIGHT_TEXTAREA_LIST, height);
        this.textareaNameList.current.style.height = height + 'px';

        if (parseFloat(this.textareaNameList.current.style.height) >= MAX_HEIGHT_TEXTAREA_LIST) {
            this.textareaNameList.current.style.overflow = 'hidden scroll';

            return;
        }

        this.textareaNameList.current.style.overflow = 'hidden';
    };

    renderCards = () => {
        const { cards } = this.state;

        return cards.map(value => (
            <Card
                key={value.id}
                cardId={value.id}
                text={value.text}
            />
        ));
    }

    render() {
        const { listName } = this.state;

        return (
            <div className='list-wrapper'>
                <div onClick={this.openAddHeaderForm} className={this.classNames.list}>
                    <div className='list__header'>
                        <div onClick={this.changeNameList} className={this.classNames.listHeader}>{listName}</div>
                        <textarea
                            onBlur={this.handleClickOutside}
                            onChange={this.resizeArea}
                            className={this.classNames.listTextareaHeader}
                            ref={this.textareaNameList}
                            defaultValue={listName}
                        />
                        <div className={this.classNames.hiddenlistHeader}>
                            <div ref={this.hiddenTextAreaNameList} className="textarea_behavior" id="list__header-textarea_hidden" />
                        </div>
                    </div>
                    {this.renderCards()}
                    <div onClick={this.cardAdd} className={this.classNames.addCard}>+ Добавить карточку</div>
                    <div className={this.classNames.addCardForm}>
                        <textarea
                            ref={this.textareaCard}
                            defaultValue=''
                            className='list__textarea'
                            placeholder='Ввести заголовок для этой карточки'
                        />
                        <button onClick={this.addCardToList} className='add-list__button add-list__button_allowToPress'>Добавить карточку</button>
                        <div onClick={this.closeCardAdd} className='list__close'>✕</div>
                    </div>
                </div>
            </div>
        )
    }
}
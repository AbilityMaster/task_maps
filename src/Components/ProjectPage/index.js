import React, { Component } from 'react';
import nanoid from 'nanoid';
import { DEFAULT_COLOR, TYPE_SEARCH, MESSAGES } from '../const';
import List from './List';
import './index.scss';

export default class ProjectPage extends Component {
    constructor(props) {
        super();
        this.localStorage = props.localStorage;
        const dataLS = this.localStorage.dataset;
        const projectId = props.match.params.id;
        this.saveTime(projectId);
        this.state = {
            projectName: this.getprojectName(dataLS, projectId),
            isVisibleAddHeaderForm: false,
            isVisibleInputNameProject: false,
            lists: this.loadLists(dataLS, projectId),
            dragObject: {}
        }
        this.input = React.createRef();
        this.inputForNameProject = React.createRef();
        this.draggbleContainer = React.createRef();
    }

    saveTime = (id) => {
        const dataLS = this.localStorage.dataset;
        let now = new Date();

        for (let i = 0; i < dataLS.length; i++) {
            if (dataLS[i].id === id) {
                dataLS[i].time ? dataLS[i].time = now.getTime() : dataLS[i].time = now.getTime();
                dataLS[i].isRecentlyViewed ? dataLS[i].isRecentlyViewed = true : dataLS[i].isRecentlyViewed = true;
            }
        }

        this.localStorage.dataset = dataLS;
    };

    getprojectName = (dataLS, id) => {
        const project = dataLS.find(project => project.id === id);

        return project.name || '';
    }

    loadLists = (dataLS, id) => {
        const project = dataLS.find(project => project.id === id);

        return project.lists || [];
    }

    get background() {
        const dataLS = this.localStorage.dataset;
        const id = this.props.match.params.id;
        const project = dataLS.find(project => (project.id === id));

        return project.background || DEFAULT_COLOR;
    };

    openAddHeaderForm = () => {
        const { isVisibleAddHeaderForm } = this.state;

        if (isVisibleAddHeaderForm) {
            return;
        }

        this.setState({
            isVisibleAddHeaderForm: true
        });
    };

    closeAddHeaderForm = () => {
        this.setState({
            isVisibleAddHeaderForm: false
        });
    };

    addHeaderToList = () => {
        const { lists } = this.state;
        const id = this.props.match.params.id;
        const dataLS = this.localStorage.dataset;
        const listName = this.input.current.value;
        const position = lists.length;

        if (!listName) {
            return;
        }

        lists.push({
            id: nanoid(3),
            name: listName,
            position: position
        });

        for (let i = 0; i < dataLS.length; i++) {
            if (dataLS[i].id === id) {
                dataLS[i].lists = lists;
            }
        }

        this.setState({
            lists
        }, () => {
            if (this.input.current) {
                this.input.current.focus();
                this.input.current.value = '';
            }
        });

        this.localStorage.dataset = dataLS;
    };

    onMouseMove = (listId, card) => {
        const { lists } = this.state;

        const tempLists = JSON.parse(JSON.stringify(lists));
        const list = tempLists.find(value => (value.id === listId));
        const index = list.cards.findIndex(value => (value.id === card.id));
        list.cards[index] = card;

        this.setState({
            lists: tempLists
        });
    };

    addCardToList = (cards, listId) => {
        const projects = this.localStorage.dataset;
        const projectId = this.props.match.params.id;
        const project = projects.find(project => (project.id === projectId));
        const projectIndex = projects.findIndex(project => (project.id === projectId));
        const listIndex = project ? project.lists.findIndex(list => (list.id === listId)) : 0;

        projects[projectIndex].lists[listIndex].cards = cards;
        this.localStorage.dataset = projects;

        this.setState({
            lists: project.lists
        });
    }

    findListIndex = (searchType, arg) => {
        const { lists } = this.state;

        switch (searchType) {
            case TYPE_SEARCH.BY_ID: {
                return lists.findIndex(list => (list.id === arg));
            }
            case TYPE_SEARCH.BY_POSITION: {
                return lists.findIndex(list => (list.position === arg));
            }
            default:
                console.log(MESSAGES.ERROR.TYPE_FIND);
                break;
        }
    };

    findList = (key) => {
        const { lists } = this.state;
        const list = lists.find(list => (list.position === key)) || '';

        return list;
    };

    unsetDrag = (listPosition, cardId) => {
        const { lists } = this.state;

        const tempLists = JSON.parse(JSON.stringify(lists));

        const list = tempLists.find(list => (list.position === listPosition));
        const cards = list ? list.cards : [];
        const card = cards ? cards.find(card => (card.id === cardId)) : {};
        card.isDrag = false;

        this.setState({
            lists: tempLists
        });
    };

    updateCardNames = (cards, listId) => {
        let lists = [];
        const { lists: oldLists } = this.state;

        lists = JSON.parse(JSON.stringify(oldLists));

        const index = lists.findIndex(value => (value.id === listId));

        lists[index].cards = JSON.parse(JSON.stringify(cards));

        this.setState({
            lists
        });
    };

    getLists = () => {
        const { lists } = this.state;

        return JSON.parse(JSON.stringify(lists));
    };

    updateCardName = (list) => {
        const { lists } = this.state;

        const tempLists = JSON.parse(JSON.stringify(lists));
        const listIndex = tempLists.findIndex( value => ( value.id === list.id ));
        tempLists[listIndex] = list;

        this.setState({
            lists: tempLists
        });
    }

    renderLists = () => {
        const { lists } = this.state;
        const _lists = JSON.parse(JSON.stringify(lists));
        const id = this.props.match.params.id;

        return _lists.map(value =>
            <List
                key={value.id}
                projectId={id}
                list={value}
                cards={value.cards}
                addCardToList={this.addCardToList}
                findList={this.findList}
                updateCardNames={this.updateCardNames}
                updateLists={this.updateLists}
                findListIndex={this.findListIndex}
                onMouseMove={this.onMouseMove}
                unsetDrag={this.unsetDrag}
                getLists={this.getLists}
                changeListName={this.changeListName}
                updateCardName={this.updateCardName}
                localStorage={this.localStorage}
            />
        );
    };

    changeListName = (list) => {
        const { lists } = this.state;

        const tempLists = JSON.parse(JSON.stringify(lists));
        const tempList = tempLists.find(value => (value.id === list.id));
        tempList.name = list.name;

        this.setState({
            lists: tempLists
        });
    };

    updateLists = (data) => {
        this.setState({
            lists: data
        });
    };

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClickOutside, false);
    }

    changeNameOfProject = () => {
        const { projectName } = this.state;

        if (!this.state.isVisibleInputNameProject) {
            document.addEventListener('click', this.handleClickOutside, false);
        } else {
            document.removeEventListener('click', this.handleClickOutside, false);
        }

        this.setState(prevState => ({
            isVisibleInputNameProject: !prevState.isVisibleInputNameProject,
        }), () => {
            if (this.inputForNameProject.current) {
                this.inputForNameProject.current.value = projectName;
                this.inputForNameProject.current.focus();
                this.inputForNameProject.current.select();
            }
        });
    };

    handleClickOutside = (event) => {
        const dataLS = this.localStorage.dataset;
        const id = this.props.match.params.id;
        const projectName = this.inputForNameProject.current.value;

        if (this.inputForNameProject.current.contains(event.target)) {
            return
        }

        for (let i = 0; i < dataLS.length; i++) {
            if (dataLS[i].id === id) {
                dataLS[i].name = projectName === '' ? dataLS[i].name : projectName;
            }
        }

        this.setState({
            projectName
        })

        this.localStorage.dataset = dataLS;
        this.changeNameOfProject();
    };

    get classNames() {
        const { isVisibleAddHeaderForm, isVisibleInputNameProject } = this.state;
        const classNames = {
            addList: ['add-list'],
            addListHeader: ['add-list__header'],
            addListForm: ['add-list__form'],
            projectName: ['project-board__name'],
            projectNameInput: ['project-board__name-input']
        }

        if (isVisibleAddHeaderForm) {
            classNames.addList.push('add-list_open');
            classNames.addListHeader.push('add-list__header_hidden');
        } else {
            classNames.addList.push('add-list_close');
            classNames.addListForm.push('add-list__form_hidden');
        }

        if (isVisibleInputNameProject) {
            classNames.projectNameInput.push('project-board__name-input_visible');
        }

        return {
            addList: classNames.addList.join(' '),
            addListHeader: classNames.addListHeader.join(' '),
            addListForm: classNames.addListForm.join(' '),
            projectName: classNames.projectName.join(' '),
            projectNameInput: classNames.projectNameInput.join(' ')
        }
    }

    render() {
        const { projectName } = this.state;

        return (
            <div className='project-board' style={{ background: this.background }}>
                <div className='header-board'>
                    <div onClick={this.changeNameOfProject} className={this.classNames.projectName}>{projectName}</div>
                    <input ref={this.inputForNameProject} defaultValue={projectName} className={this.classNames.projectNameInput} type='text' />
                </div>
                <div className='project-board__body'>
                    {this.renderLists()}
                    <div className='list-wrapper-adding'>
                        <div onClick={this.openAddHeaderForm} className={this.classNames.addList}>
                            <div className={this.classNames.addListHeader}>+ Добавить список</div>
                            <div className={this.classNames.addListForm}>
                                <input ref={this.input} className='add-list__input' type='text' placeholder='Ввести заголовок списка'></input>
                                <button onClick={this.addHeaderToList} className='add-list__button add-list__button_allowToPress'>Добавить список</button>
                                <div onClick={this.closeAddHeaderForm} className='add-list__close'>✕</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        )
    }
}
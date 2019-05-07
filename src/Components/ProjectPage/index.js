import React, { Component } from 'react';
import nanoid from 'nanoid';
import { DEFAULT_COLOR } from '../const';
import LocalStorage from '../localStorage';
import projectInfo from '../../../package.json';
import List from './List';
import './index.scss';

export default class ProjectPage extends Component {
    constructor(props) {
        super();
        this.localStorage = new LocalStorage(projectInfo.version, projectInfo.name);
        const dataLS = this.localStorage.dataset;
        this.saveTime(props.match.params.id);
        this.state = {
            projectName: dataLS.find(element => element.id === props.match.params.id).projectName ? dataLS.find(element => element.id === props.match.params.id).projectName : '',
            isVisibleAddHeaderForm: false,
            isVisibleInputNameProject: false,
            lists: dataLS.find(el => el.id === props.match.params.id).lists ? dataLS.find(el => el.id === props.match.params.id).lists : []
        }
        this.input = React.createRef();
        this.inputForNameProject = React.createRef();
    }

    saveTime = (id) => {
        const LC = this.localStorage.dataset;
        let now = new Date();

        for (let i = 0; i < LC.length; i++) {
            if (LC[i].id === id) {
                LC[i].time ? LC[i].time = now.getTime() : LC[i].time = now.getTime();
                LC[i].isAddedToRecentlyViewed ? LC[i].isAddedToRecentlyViewed = true : LC[i].isAddedToRecentlyViewed = true;
            }
        }

        this.localStorage.dataset = LC;
    };


    get projectName() {
        const temp = this.localStorage.dataset;
        const id =  this.props.match.params.id
        const project = temp.find( elem => elem.id === id);

        return project.projectName || '';
    }

    get background() {
        const dataLS = this.localStorage.dataset;
        const id = this.props.match.params.id;
        const project = dataLS.find( project => ( project.id === id));

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

        lists.push({
            id: nanoid(3),
            header: this.input.current.value
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
    }

    renderLists = () => {
        const { lists } = this.state;
        const id = this.props.match.params.id;

        return lists.map(value =>
            <List
                key={value.id}
                listId={value.id}
                projectId={id}
                header={value.header}
                localStorage={this.localStorage}
            />
        );
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
                dataLS[i].projectName = projectName === '' ? dataLS[i].projectName : projectName;
            }
        }

        this.setState({
            projectName
        })

        this.localStorage.dataset = dataLS;
        this.changeNameOfProject();
    }

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
                    <div className='list-wrapper'>
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
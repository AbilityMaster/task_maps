import React, { Component } from 'react';
import nanoid from 'nanoid';
import LocalStorage from '../localStorage';
import projectInfo from '../../../package.json';
import List from './List';
import './index.scss';

export default class ProjectPage extends Component {
    constructor(props) {
        super();
        this.localStorage = new LocalStorage(projectInfo.version, projectInfo.name);
        const dataLS = this.localStorage.dataset;
        this.startTime(props.match.params.id);
        this.state = {
            projectName: dataLS.find( element => element.id === props.match.params.id).projectName,
            isVisibleAddHeaderForm: false,
            lists: dataLS.find( el => el.id === props.match.params.id ).lists ? dataLS.find( el => el.id === props.match.params.id ).lists : []
        }
        this.input = React.createRef();
        this.inputForNameProjectChange = React.createRef();
    }

    startTime = (id) => {
        const LC = this.localStorage.dataset;
        let now = new Date();

        for (let i = 0; i < LC.length; i++) {
            if (LC[i].id === id) {
                LC[i].time ? LC[i].time = now.getTime() : LC[i].time = now.getTime();
                LC[i].isAddedToRecentlyViewed ? LC[i].isAddedToRecentlyViewed = true : LC[i].isAddedToRecentlyViewed = true;
            }
        }

        this.localStorage.dataset = LC;
    }


    getProjectName = () => {
        let temp = this.localStorage.dataset;


        for (let i = 0; i < temp.length; i++) {
            if (temp[i].id === this.props.match.params.id) {
                return temp[i].projectName;
            }
        }
    }

    getBackground = () => {
        let temp = this.localStorage.dataset;

        for (let i = 0; i < temp.length; i++) {
            if (temp[i].id === this.props.match.params.id) {
                return temp[i].background;
            }
        }
    }

    openAddHeaderForm = () => {
        const { isVisibleAddHeaderForm } = this.state;

        if (isVisibleAddHeaderForm) {
            return;
        }
        this.setState({
            isVisibleAddHeaderForm: true
        });
    }

    closeAddHeaderForm = () => {
        this.setState({
            isVisibleAddHeaderForm: false
        });
    }

    addHeaderToList = () => {
        const { lists } = this.state;
        const dataLS = this.localStorage.dataset;

        lists.push({
            id: nanoid(3),
            header: this.input.current.value
        });

        for (let i = 0; i < dataLS.length; i++) {
            if (dataLS[i].id === this.props.match.params.id) {
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

        return lists.map(value =>
            <List
                key={value.id}
                header={value.header}
            />
        )
    }

    changeNameOfProject = () => {
        const { projectName } = this.state;

        this.inputForNameProjectChange.current.value = projectName;

        this.setState({
            isVisibleInputForNameProjectChange: true
        }, () => {
            if (this.inputForNameProjectChange.current) {
                this.inputForNameProjectChange.current.focus();
                this.inputForNameProjectChange.current.select();
            }
        });

    }

    get classNames() {
        const { isVisibleAddHeaderForm, isVisibleInputForNameProjectChange } = this.state;
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

        if (isVisibleInputForNameProjectChange) {
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

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
       }
       componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
       }

       
       handleClickOutside = () => {
        console.log('+');
    }

    render() {
        return (
            <div className='project-board' style={{ background: this.getBackground() }}>
                <div className='header-board'>
                    <div onClick={this.changeNameOfProject} className={this.classNames.projectName}>{this.getProjectName()}                    
                        <input ref={this.inputForNameProjectChange} onMouseOut={this.handleMouseOver} className={this.classNames.projectNameInput} type='text'></input>
                    </div>
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
const dict = {
    state: {
        // 经常需要读取的数据字典
        sex: [],
        userType: [],
        questionType: [],
    },
    mutations: {
        // 设置值的改变方法
        setSex(state, list) {
            state.sex = list;
        },

        setUserType(state, list) {
            state.userType = list;
        },

        setQuestionType(state, list) {
            state.questionType = list;
        },
    }
};

export default dict;

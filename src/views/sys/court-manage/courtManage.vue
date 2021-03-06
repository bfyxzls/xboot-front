<style lang="less">
@import "../../../styles/table-common.less";
@import "./courtManage.less";
</style>
<template>
  <div class="search">
    <Card>
      <Form ref="searchForm" :model="searchForm" inline :label-width="70">
        <FormItem label="组织机构">
          <department-tree-choose @on-change="handleSelectDepTree" ref="depTree"></department-tree-choose>
        </FormItem>
        <Form-item label="项目类型" prop="projectType">
          <Select v-model="searchForm.projectType" placeholder="请选择" clearable style="width: 200px">
            <Option value="商品房">商品房</Option>
            <Option value="保障房">保障房</Option>
            <Option value="房改房">房改房</Option>
            <Option value="其他">其他</Option>
          </Select>
        </Form-item>
        <Form-item label="名称" prop="title">
          <Input
            type="text"
            v-model="searchForm.title"
            clearable
            placeholder="请输入名称"
            style="width: 200px"
          />
        </Form-item>
        <Form-item label="创建时间">
          <DatePicker
            type="daterange"
            format="yyyy-MM-dd"
            clearable
            @on-change="selectDateRange"
            placeholder="选择起始时间"
            style="width: 200px"
          ></DatePicker>
        </Form-item>
        <Form-item style="margin-left:-35px;" class="br">
          <Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
        </Form-item>
      </Form>

      <Row class="operation">
        <Button @click="addCourt" type="primary" icon="md-add">添加小区</Button>
        <Button @click="delAll" icon="md-trash">批量删除</Button>
        <Button @click="init" icon="md-refresh">刷新</Button>
        <Button type="dashed" @click="openTip=!openTip">{{openTip ? "关闭提示" : "开启提示"}}</Button>
      </Row>
      <Row v-show="openTip">
        <Alert show-icon>
          已选择
          <span class="select-count">{{selectCount}}</span> 项
          <a class="select-clear" @click="clearSelectAll">清空</a>
        </Alert>
      </Row>
      <Row>
        <Table
          :loading="loading"
          border
          :columns="columns"
          :data="data"
          ref="table"
          sortable="custom"
          @on-sort-change="changeSort"
          @on-selection-change="changeSelect"
        ></Table>
      </Row>
      <Row type="flex" justify="end" class="page">
        <Page
          :current="pageNumber"
          :total="total"
          :page-size="pageSize"
          @on-change="changePage"
          @on-page-size-change="changePageSize"
          :page-size-opts="[10,20,50]"
          size="small"
          show-total
          show-elevator
          show-sizer
        ></Page>
      </Row>
    </Card>

    <!-- 添加和编辑 -->
    <Modal :title="modalTitle" v-model="roleModalVisible" :mask-closable="false" :width="500">
      <Form ref="roleForm" :model="roleForm" :label-width="80" :rules="roleFormValidate">
        <FormItem label="名称" prop="title">
          <Input v-model="roleForm.title" placeholder="请输入名称" />
        </FormItem>
        <Form-item label="项目类型" prop="projectType">
          <Select v-model="roleForm.projectType" placeholder="请选择" clearable style="width: 200px">
            <Option value="商品房">商品房</Option>
            <Option value="保障房">保障房</Option>
             <Option value="房改房">房改房</Option>
            <Option value="其他">其他</Option>
          </Select>
        </Form-item>
        <FormItem label="所属部门">
          <department-tree-choose @on-change="handleSelectDepTree" ref="depTree"></department-tree-choose>
        </FormItem>
        <FormItem label="物业" prop="tenementId">
          <Select v-model="roleForm.tenementId">
            <Option
              v-for="item in tenementList"
              v-bind:value="item.id"
              :key="item.id"
              :label="item.title"
            >
              <span style="margin-right:10px;">{{ item.title }}</span>
              <span style="color:#ccc;">{{ item.description }}</span>
            </Option>
          </Select>
        </FormItem>
        <FormItem label="备注" prop="description">
          <Input v-model="roleForm.description" />
        </FormItem>
        <FormItem label="地区" prop="region">
          <Input v-model="roleForm.region" placeholder="地区" />
        </FormItem>
        <FormItem label="地址" prop="address">
          <Input v-model="roleForm.address" placeholder="地址" />
        </FormItem>
        <FormItem label="经度" prop="longitude">
          <Input v-model="roleForm.longitude" placeholder="经度" />
        </FormItem>
        <FormItem label="纬度" prop="latitude">
          <Input v-model="roleForm.latitude" placeholder="纬度" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancel">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="submitSave">提交</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  addCourt,
  editCourt,
  deleteCourt,
  getCourtListData,
  getAllTenementList
} from "@/api/index";
import util from "@/libs/util.js";
import departmentTreeChoose from "@/views/my-components/xboot/department-tree-choose";

export default {
  name: "court-manage",
  components: {
    departmentTreeChoose
  },
  data() {
    return {
      openTip: true,
      openLevel: "0",
      loading: true,
      treeLoading: true,
      depTreeLoading: true,
      submitPermLoading: false,
      submitDepLoading: false,
      searchKey: "",
      sortColumn: "createTime",
      sortType: "desc",
      modalType: 0,
      modalTitle: "",
      roleForm: {
        name: "",
        description: "",
        address: "",
        region: "",
        longitude: 0,
        latitude: 0
      },
      roleFormValidate: {
        name: [{ required: true, message: "名称不能为空", trigger: "blur" }]
      },
      searchForm: {
        id: "",
        title: "",
        startDate: "",
        endDate: ""
      },
      submitLoading: false,
      selectList: [],
      selectCount: 0,
      columns: [
        {
          type: "selection",
          width: 60,
          align: "center"
        },
        {
          type: "index",
          width: 60,
          align: "center"
        },
        {
          title: "名称",
          key: "title",
          width: 150,
          sortable: true
        },
        {
          title: "项目类型",
          key: "projectType",
          width: 150,
          sortable: true
        },
        {
          title: "机构",
          key: "departmentTitle",
          width: 150,
          sortable: true
        },
        {
          title: "物业",
          key: "tenementTitle",
          width: 150,
          sortable: true
        },
        {
          title: "备注",
          key: "description",
          minWidth: 150,
          sortable: true
        },
        {
          title: "创建时间",
          key: "createTime",
          width: 170,
          sortable: true,
          sortType: "desc"
        },
        {
          title: "更新时间",
          key: "updateTime",
          width: 170,
          sortable: true
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          fixed: "right",
          width: 300,
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.edit(params.row);
                    }
                  }
                },
                "编辑"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.remove(params.row);
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ],
      data: [],
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      permData: [],
      editRolePermId: "",
      selectAllFlag: false,
      depData: [],
      dataType: 0,
      roleModalVisible: false,
      editDepartments: [],
      tenementList: []
    };
  },
  methods: {
    init() {
      this.getList();

      getAllTenementList().then(res => {
        if (res.success) {
          this.tenementList = res.result;
        }
      });
    },
    handleSelectDepTree(v) {
      this.roleForm.departmentId = v;
      this.searchForm.departmentId = v;
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getList();
    },
    handleReset() {
      this.$refs.searchForm.resetFields();
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.selectDate = null;
      this.searchForm.startDate = "";
      this.searchForm.endDate = "";
      this.selectDep = [];
      this.searchForm.departmentId = "";
      // 重新加载数据
      this.getUserList();
    },
    selectDateRange(v) {
      if (v) {
        this.searchForm.startDate = v[0];
        this.searchForm.endDate = v[1];
      }
    },

    renderContent(h, { root, node, data }) {
      let icon = "";
      if (data.level == 0) {
        icon = "ios-navigate";
      } else if (data.level == 1) {
        icon = "md-list-box";
      } else if (data.level == 2) {
        icon = "md-list";
      } else if (data.level == 3) {
        icon = "md-radio-button-on";
      } else {
        icon = "md-radio-button-off";
      }
      return h(
        "span",
        {
          style: {
            display: "inline-block",
            cursor: "pointer"
          },
          on: {
            click: () => {
              data.checked = !data.checked;
            }
          }
        },
        [
          h("span", [
            h("Icon", {
              props: {
                type: icon,
                size: "16"
              },
              style: {
                "margin-right": "8px",
                "margin-bottom": "3px"
              }
            }),
            h("span", data.title)
          ])
        ]
      );
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getList();
      this.clearSelectAll();
    },
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getList();
    },
    changeSort(e) {
      this.sortColumn = e.key;
      this.sortType = e.order;
      if (e.order == "normal") {
        this.sortType = "";
      }
      this.getList();
    },
    getList() {
      // 多条件搜索用户列表
      this.loading = true;
      getCourtListData(this.searchForm).then(res => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.content;
          this.total = res.result.totalElements;
        }
      });
    },
    cancel() {
      this.roleModalVisible = false;
    },
    submitSave() {
      this.$refs.roleForm.validate(valid => {
        if (valid) {
          if (this.modalType == 0) {
            // 添加
            this.submitLoading = true;
            addCourt(this.roleForm).then(res => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("操作成功");
                this.getList();
                this.roleModalVisible = false;
              }
            });
          } else {
            this.submitLoading = true;
            editCourt(this.roleForm).then(res => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("操作成功");
                this.searchForm.departmentId = "";
                this.getList();
                this.roleModalVisible = false;
              }
            });
          }
        }
      });
    },
    addCourt() {
      this.modalType = 0;
      this.modalTitle = "添加";
      this.$refs.roleForm.resetFields();
      this.$refs.depTree.setData("", "");
      delete this.roleForm.id;
      this.searchForm.departmentId = "";
      this.roleModalVisible = true;
    },
    edit(v) {
      this.modalType = 1;
      this.modalTitle = "编辑";
      this.$refs.roleForm.resetFields();
      // 转换null为""
      for (let attr in v) {
        if (v[attr] == null) {
          v[attr] = "";
        }
      }
      let str = JSON.stringify(v);
      let roleInfo = JSON.parse(str);
      this.roleForm = roleInfo;
      this.$refs.depTree.setData(
        roleInfo.departmentId,
        roleInfo.departmentTitle
      );
      this.searchForm.departmentId = "";
      this.roleModalVisible = true;
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除 " + v.title + " ?",
        loading: true,
        onOk: () => {
          deleteCourt({ ids: v.id }).then(res => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("删除成功");
              this.getList();
            }
          });
        }
      });
    },

    clearSelectAll() {
      this.$refs.table.selectAll(false);
    },
    changeSelect(e) {
      this.selectList = e;
      this.selectCount = e.length;
    },
    delAll() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要删除的数据");
        return;
      }
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除所选的 " + this.selectCount + " 条数据?",
        loading: true,
        onOk: () => {
          let ids = "";
          this.selectList.forEach(function(e) {
            ids += e.id + ",";
          });
          ids = ids.substring(0, ids.length - 1);
          deleteCourt({ ids: ids }).then(res => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("删除成功");
              this.clearSelectAll();
              this.getList();
            }
          });
        }
      });
    },

    // 全选反选
    selectTreeAll() {
      this.selectAllFlag = !this.selectAllFlag;
      let select = this.selectAllFlag;
      this.selectedTreeAll(this.permData, select);
    },
    // 递归全选节点
    selectedTreeAll(permData, select) {
      let that = this;
      permData.forEach(function(e) {
        e.checked = select;
        if (e.children && e.children.length > 0) {
          that.selectedTreeAll(e.children, select);
        }
      });
    }
  },
  mounted() {
    this.init();
  }
};
</script>
<style lang="less">
@import "../../../styles/table-common.less";
@import "./templateManage.less";
</style>
<template>
  <div class="search">
    <Form ref="roleForm" :model="roleForm" :label-width="80">
      <FormItem label="名称">{{roleForm.title}}</FormItem>
      <FormItem label="类型">{{roleForm.typeTitle}}</FormItem>
      <FormItem label="内容">{{roleForm.content}}</FormItem>
    </Form>
  </div>
</template>

<script>
import { getDetail } from "@/api/index";
import util from "@/libs/util.js";
export default {
  name: "template-detail",
  data() {
    return {
      roleForm: {
        name: "",
        description: ""
      }
    };
  },
  methods: {
    init() {
      getDetail(this.$route.params.id).then(res => {
        if (res.success) {
          this.roleForm = res.result;
        }
      });
    }
  },
  mounted() {
    this.init();
  }
};
</script>
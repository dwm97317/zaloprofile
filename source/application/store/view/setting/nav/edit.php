<div class="row-content am-cf">
    <div class="row">
        <div class="am-u-sm-12 am-u-md-12 am-u-lg-12">
            <div class="widget am-cf">
                <form id="my-form" class="am-form tpl-form-line-form" enctype="multipart/form-data" method="post">
                    <div class="widget-body">
                        <fieldset>
                            <div class="widget-head am-cf">
                                <div class="widget-title am-fl">编辑导航菜单</div>
                            </div>
                            <div class="am-form-group">
                                <label class="am-u-sm-3 am-u-lg-2 am-form-label form-require"> 导航名称 </label>
                                <div class="am-u-sm-9 am-u-end">
                                    <input type="text" class="tpl-form-input" name="nav[name]"
                                           value="<?= $model['name'] ?>" required>
                                </div>
                            </div>
                            <div class="am-form-group">
                                <label class="am-u-sm-3 am-u-lg-2 am-form-label form-require">导航图标 </label>
                                <div class="am-u-sm-9 am-u-end">
                                    <div class="am-form-file">
                                        <button type="button"
                                                class="upload-file am-btn am-btn-secondary am-radius">
                                            <i class="am-icon-cloud-upload"></i> 选择图片
                                        </button>
                                        <div class="uploader-list am-cf">
                                                <div class="file-item">
                                                    <a href="<?= $model['image']['file_path'] ?>"
                                                       title="点击查看大图" target="_blank">
                                                        <img src="<?= $model['image']['file_path'] ?>">
                                                    </a>
                                                    <input type="hidden" name="nav[nav_icon]"
                                                           value="<?= $model['nav_icon'] ?>">
                                                    <i class="iconfont icon-shanchu file-item-delete"></i>
                                                </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="am-form-group">
                                <label class="am-u-sm-3 am-u-lg-2 am-form-label form-require"> 导航类型 </label>
                                <div class="am-u-sm-9 am-u-end">
                                    <label class="am-radio-inline">
                                        <input type="radio" name="nav[nav_linktype]" value="1" data-am-ucheck
                                                <?= $model['nav_linktype'] == 1 ? 'checked' : '' ?>>
                                        小程序内部链接
                                    </label>
                                    <label class="am-radio-inline">
                                        <input type="radio" name="nav[nav_linktype]" value="2" data-am-ucheck
                                         <?= $model['nav_linktype'] == 2 ? 'checked' : '' ?>>
                                        外部链接
                                    </label>
                                </div>
                            </div>
                            <div class="am-form-group">
                                <label class="am-u-sm-3 am-u-lg-2 am-form-label"> 链接地址 </label>
                                <div class="am-u-sm-9 am-u-end">
                                    <input type="text" min="0" class="tpl-form-input" name="nav[nav_link]" value="<?= $model['nav_link'];?>"
                                           ><small>注意：小程序内部链接使用链接库中的<a target="_blank" href="index.php?s=/store/wxapp.page/links">点击打开链接库</a></small>
                                </div>
                            </div>
                            <div class="am-form-group">
                                <label class="am-u-sm-3 am-u-lg-2 am-form-label form-require"> 是否显示 </label>
                                <div class="am-u-sm-9 am-u-end">
                                    <label class="am-radio-inline">
                                        <input type="radio" name="nav[is_use]" value="0" data-am-ucheck
                                                <?= $model['is_use'] == 0 ? 'checked' : '' ?>>
                                        显示
                                    </label>
                                    <label class="am-radio-inline">
                                        <input type="radio" name="nav[is_use]" value="1" data-am-ucheck
                                         <?= $model['is_use'] == 1 ? 'checked' : '' ?>>
                                        隐藏
                                    </label>
                                </div>
                            </div>
                            <div class="am-form-group">
                                <label class="am-u-sm-3 am-u-lg-2 am-form-label form-require">排序 </label>
                                <div class="am-u-sm-9 am-u-end">
                                    <input type="number" min="0" class="tpl-form-input" name="nav[sort]"
                                           value="<?= $model['sort'] ?>" required>
                                    <small>数字越小越靠前</small>
                                </div>
                            </div>
                            <div class="am-form-group">
                                <div class="am-u-sm-9 am-u-sm-push-3 am-margin-top-lg">
                                    <button type="submit" class="j-submit am-btn am-btn-secondary">提交
                                    </button>
                                </div>
                            </div>
                        </fieldset>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
<!-- 图片文件列表模板 -->
{{include file="layouts/_template/tpl_file_item" /}}

<!-- 文件库弹窗 -->
{{include file="layouts/_template/file_library" /}}
<script>
    $(function () {

        /**
         * 表单验证提交
         * @type {*}
         */
        $('#my-form').superForm();

    });
    
     $(function () {
         // 选择图片
        $('.upload-file').selectImages({
            name: 'nav[nav_icon]'
        });
      

        /**
         * 表单验证提交
         * @type {*}
         */
        $('#my-form').superForm();
    })
</script>

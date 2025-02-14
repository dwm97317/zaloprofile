<div class="row-content am-cf">
    <div class="row">
        <div class="am-u-sm-12 am-u-md-12 am-u-lg-12">
            <div class="widget am-cf">
                <div class="widget-head am-cf">
                    <div class="widget-title am-cf">货架列表</div>
                </div>
                <div class="widget-body am-fr">
                    <div class="am-u-sm-12 am-u-md-6 am-u-lg-6">
                        <div class="am-form-group">
                            <div class="am-btn-toolbar">
                                <?php if (checkPrivilege('shelf_manager.index/add')): ?>
                                    <div class="am-btn-group am-btn-group-xs">
                                        <a class="am-btn am-btn-default am-btn-success am-radius"
                                           href="<?= url('shelf_manager.index/add') ?>">
                                            <span class="am-icon-plus"></span> 新增
                                        </a>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                    <div class="am-u-sm-12">
                        <table width="100%" class="am-table am-table-compact am-table-striped tpl-table-black ">
                            <thead>
                            <tr>
                                <th>货架ID</th>
                                <th>仓库名称</th>
                                <th>货架名称</th>
                                <th>货架编号</th>
                                <th>货架行数</th>
                                <th>货架列数</th>
                                <th>添加时间</th>
                                <th>操作</th>
                            </tr>
                            </thead>
                            <tbody>
                            <?php if (!$list->isEmpty()): ?>
                                <?php foreach ($list as $item): ?>
                                    <tr>
                                        <td class="am-text-middle"><?= $item['id'] ?></td>
                                        <td class="am-text-middle"><?= $item['storage']['shop_name'] ?></td>
                                        <td class="am-text-middle"><?= $item['shelf_name'] ?></td>
                                        <td class="am-text-middle"><?= $item['shelf_no'] ?></td>
                                        <td class="am-text-middle"><?= $item['shelf_column'] ?></td>
                                        <td class="am-text-middle"><?= $item['shelf_row'] ?></td>
                                        <td class="am-text-middle"><?= date('Y-m-d',$item['created_time']) ?></td>
                                        <td class="am-text-middle">
                                            <div class="tpl-table-black-operation">
                                                <?php if (checkPrivilege('shelf_manager.index/edit')): ?>
                                                    <a href="<?= url('shelf_manager.index/edit',
                                                        ['id' => $item['id']]) ?>">
                                                        <i class="am-icon-pencil"></i> 编辑
                                                    </a>
                                                <?php endif; ?>
                                                <?php if (checkPrivilege('shop.shelf/datashelfunit')): ?>
                                                <a href="<?= url('shop.shelf/datashelfunit',
                                                        ['shelf_id' => $item['id']]) ?>">
                                                        <i class="iconfont icon-xiangqing"></i> 货位详情
                                                </a>
                                                <?php endif; ?>
                                          
                                                    <a href="javascript:;"
                                                       class="item-delete tpl-table-black-operation-del"
                                                       data-id="<?= $item['id'] ?>">
                                                        <i class="am-icon-trash"></i> 删除
                                                    </a>
                                        
                                            </div>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <tr>
                                    <td colspan="6" class="am-text-center">暂无记录</td>
                                </tr>
                            <?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                    <div class="am-u-lg-12 am-cf">
                        <div class="am-fr"><?= $list->render() ?> </div>
                        <div class="am-fr pagination-total am-margin-right">
                            <div class="am-vertical-align-middle">总记录：<?= $list->total() ?></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<script>
    $(function () {
        // 删除元素
        var url = "<?= url('shelf_manager.index/shelfdelete') ?>";
        $('.item-delete').delete('id', url);
    });
</script>


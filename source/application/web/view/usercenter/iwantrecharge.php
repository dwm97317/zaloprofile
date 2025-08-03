<div class="card">
    <div class="card-header border-bottom">
        <h4 class="card-title">充值申请</h4>
    </div>
    <div class="card-body">
        <!-- 充值提示信息 -->
        <div class="alert alert-info">
            <h5>充值必读</h5>
            <p>本站所有的货币单位均为人民币(RMB)，请在填写申请的时候注意如下信息：</p>
            <ol>
                <li>将本站填写入的金额均为人民币。目前接受支付宝线上转账,马来西亚当地银行转账，在转账之后请截图一张凭证作为上传依据！以便我们查询！</li>
                <li>会员充值以后在左侧菜单我的资金里面查看充值记录审核情况。</li>
                <li>在您提交充值之后的24小时我们的客服专员会查看转账验收是否并把对应的马币金额以当时的马币(RM)兑换人民币(RMB)汇率转换成人民币打入到你的账户。</li>
            </ol>
        </div>
        <form id="depositForm" action="<?= urlCreate('/web/user/certificate') ?>" method="post" enctype="multipart/form-data">
        <div class="row">
            <div class="col-md-6">
                <!-- 账户余额 -->
                
                <div class="form-group row">
                    <label class="col-sm-4 col-form-label control-label">账户余额：</label>
                    <div class="col-sm-8">
                        <p class="form-control-plaintext text-danger font-weight-bold" style="font-size: 22px;"><?= $userinfo['balance'] ?? '0.00' ?></p>
                    </div>
                </div>
                
                <!-- 币种选择 -->
                <div class="form-group row">
                    <label class="col-sm-4 col-form-label control-label">当前币种：</label>
                    <div class="col-sm-8">
                        <?php if (!empty($currencylist)) { ?>
                            <?php foreach ($currencylist as $item) { ?>
                                <div class="form-check form-check-inline" style="padding-left: 20px;">
                                    <input class="form-check-input" type="radio" name="coin_type" value="<?= $item['id'] ?>" checked onclick="getrmbtotal();">
                                    <label class="form-check-label"><?= htmlspecialchars($item['currency_name']) ?></label>
                                    <?php if ($item['currency_name'] != "元") { ?>
                                        <label class="form-check-label">（1人民币兑换<?= $item['exchange_rate'] ?>）</label>
                                    <?php } ?>
                                </div>
                            <?php } ?>
                        <?php } ?>
                    </div>
                </div>

                <!-- 充值金额 -->
                <div class="form-group row">
                    <label class="col-sm-4 col-form-label control-label">充值金额：</label>
                    <div class="col-sm-8">
                        <div class="input-group">
                            <input type="number" class="form-control" name="amount" id="amount" value="" 
                                   oninput="calculateTotal()" placeholder="请输入金额" step="0.01" min="0">
                            <div class="input-group-append">
                                <span class="input-group-text">RMB</span>
                            </div>
                        </div>
                        <div class="mt-2">
                            <span class="text-danger font-weight-bold" style="font-size: 22px;" id="convertedAmount">0.00</span>
                            <input type="hidden" name="rmb_amount" id="rmbAmount" value="0.00">
                        </div>
                    </div>
                </div>
                
                <!-- 汇款时间 -->
                <div class="form-group row">
                    <label class="col-sm-4 col-form-label control-label">汇款时间：</label>
                    <div class="col-sm-8">
                        <input type="date" class="form-control" id="paytime" name="paytime">
                        <small class="text-muted">格式：YYYY-MM-DD（如：2025-06-19）</small>
                    </div>
                </div>
                
                <!-- 汇款方式 -->
                <div class="form-group row">
                    <label class="col-sm-4 col-form-label control-label">汇款方式：</label>
                    <div class="col-sm-8">
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="bank_type" id="atm" value="0" checked>
                            <label class="form-check-label" for="atm">银行卡转账</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="bank_type" id="online" value="1">
                            <label class="form-check-label" for="online">收款码</label>
                        </div>
                    </div>
                </div>
                
                <!-- 充值凭证上传 -->
                <div class="form-group row">
                    <label class="col-sm-4 col-form-label control-label">充值凭证：</label>
                    <div class="col-sm-8">
                        <div class="file-input-wrapper">
                            <button class="btn btn-outline-secondary" type="button">
                                <i class="fa fa-upload mr-2"></i>选择文件
                            </button>
                            <input type="file" class="d-none" id="FileUpload" name="FileUpload" accept="image/*">
                        </div>
                        <div class="progress mt-2" id="uploadProgress" style="display: none; height: 6px;">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" 
                                 role="progressbar" style="width: 0%"></div>
                        </div>
                        <div class="preview-area mt-2" id="previewContainer" style="display: none;">
                            <img id="imagePreview" src="#" alt="预览图" style="max-height: 150px; display: none;">
                            <input type="text" class="form-control mt-2" id="txtImgUrl" name="txtImgUrl" 
                                   placeholder="凭证路径" readonly>
                        </div>
                        <small class="text-muted">请上传清晰的转账凭证截图（JPEG/PNG，不超过2MB）</small>
                    </div>
                </div>
                
                <!-- 会员备注 -->
                <div class="form-group">
                    <label class="control-label">会员备注：</label>
                    <textarea class="form-control" name="remark" rows="2" 
                              placeholder="可填写转账备注或其他说明信息"></textarea>
                </div>
                
            </div>
        </div>
        
        <!-- 支付方式 -->
        <div class="card mt-4">
            <div class="card-header">
                <h5 class="card-title">支付方式</h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6" id="bank1">
                        <?php if (isset($banklist) && !empty($banklist)): ?>
                            <?php foreach ($banklist as $item): ?>
                            <div class="payment-option" data-payment-type="<?= $item['bank_type'] ?>">
                                <div class="form-check">
                                    <label class="form-check-label font-weight-bold"><?= $item['bank_name'] ?></label>
                                </div>
                                <div class="payment-details ml-4 mt-2">
                                    <p>银行帐号：<?= $item['bank_card'] ?></p>
                                    <p>银行名称：<?= $item['bank_name'] ?></p>
                                    <p>收款人：<?= $item['open_name'] ?></p>
                                </div>
                            </div>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <p class="text-muted">暂无可用支付方式</p>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 表单提交 -->
        <div class="text-center mt-4">
            <input type="hidden" id="imageIds" name="imageIds" value="">
            <button type="submit" class="btn btn-primary btn-lg mr-3" id="submitBtn">提交申请</button>
            <button type="reset" class="btn btn-outline-secondary btn-lg">重置表单</button>
        </div>
        
        </form>
    </div>
</div>
<style>
    /* 支付方式样式 */
    .payment-option {
        border: 1px solid #eee;
        padding: 15px;
        margin-bottom: 15px;
        border-radius: 5px;
        transition: all 0.3s;
    }
    .payment-option:hover {
        border-color: #007bff;
        box-shadow: 0 0 10px rgba(0, 123, 255, 0.1);
    }
    .payment-details {
        color: #666;
        font-size: 14px;
        line-height: 1.6;
    }
    
    /* 文件上传预览 */
    .preview-area {
        border: 1px dashed #ddd;
        border-radius: 4px;
        padding: 10px;
    }
    #imagePreview {
        max-width: 100%;
        border-radius: 4px;
    }
    
    /* 响应式调整 */
    @media (max-width: 576px) {
        .form-group.row .col-form-label {
            text-align: left !important;
            margin-bottom: 5px;
        }
        .form-group.row .col-sm-8 {
            padding-left: 15px;
        }
    }
</style>

<script>

// 汇率计算函数
// 汇率计算函数
function calculateTotal() {
    const amount = parseFloat(document.getElementById('amount').value) || 0;
    const selectedCurrency = document.querySelector('input[name="coin_type"]:checked');
    const currencyId = selectedCurrency.value;
    
    <?php if (!empty($currencylist)): ?>
        <?php foreach ($currencylist as $item): ?>
            if (currencyId == '<?= $item['id'] ?>') {
                <?php if ($item['currency_symbol'] == 'RM'): ?>
                    // For RM (Malaysian Ringgit), convert to RMB
                    const exchangeRate = <?= $item['exchange_rate'] ?? 1 ?>;
                    const rmbAmount = (amount / exchangeRate).toFixed(2);
                    document.getElementById('convertedAmount').textContent = rmbAmount;
                    document.getElementById('rmbAmount').value = rmbAmount;
                <?php else: ?>
                    // For RMB (Chinese Yuan), no conversion needed
                    document.getElementById('convertedAmount').textContent = amount.toFixed(2);
                    document.getElementById('rmbAmount').value = amount.toFixed(2);
                <?php endif; ?>
            }
        <?php endforeach; ?>
    <?php endif; ?>
}

function getrmbtotal() {
    calculateTotal();
}

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    calculateTotal();
    // 文件上传处理
    const fileUpload = document.getElementById('FileUpload');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressBar = uploadProgress.querySelector('.progress-bar');
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const txtImgUrl = document.getElementById('txtImgUrl');
    const submitBtn = document.getElementById('submitBtn');
    const imageIds = document.getElementById('imageIds');
    // 点击按钮触发文件选择
    document.querySelector('.file-input-wrapper button').addEventListener('click', function() {
        fileUpload.click();
    });
    
    // 文件选择变化事件
    fileUpload.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            const validTypes = ['image/jpeg', 'image/png'];
            
            // 验证文件类型
            if (!validTypes.includes(file.type)) {
                alert('请上传JPEG或PNG格式的图片');
                resetFileInput();
                return;
            }
            
            // 验证文件大小
            if (file.size > 2 * 1024 * 1024) {
                alert('图片大小不能超过2MB');
                resetFileInput();
                return;
            }
            
            // 显示预览
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
                previewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
            
            // 开始上传
            uploadFile(file);
        }
    });
    
    // 上传文件函数
    function uploadFile(file) {
        const formData = new FormData();
        formData.append('iFile', file);
        formData.append('wxapp_id', '<?= $web_id ?? "" ?>');
        formData.append('token', '<?= $token ?? "" ?>');
        
        // 显示进度条
        uploadProgress.style.display = 'block';
        progressBar.style.width = '0%';
        
        const xhr = new XMLHttpRequest();
        xhr.open('POST', "<?= urlCreate('/web/upload/image') ?>", true);
        
        // 上传进度事件
        xhr.upload.onprogress = function(e) {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                progressBar.style.width = percent + '%';
            }
        };
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.code == 1) {
                        txtImgUrl.value = response.data.file_path;
                        imageIds.value = response.data.file_id;
                       
                    } else {
                        throw new Error(response.msg || '上传失败');
                    }
                } catch (e) {
                    alert('解析响应数据失败');
                    resetFileInput();
                }
            } else {
                alert('上传失败，状态码: ' + xhr.status);
                resetFileInput();
            }
            uploadProgress.style.display = 'none';
        };
        
        xhr.onerror = function() {
            alert('上传过程中发生网络错误');
            resetFileInput();
            uploadProgress.style.display = 'none';
        };
        
        xhr.send(formData);
    }
    
    // 重置文件输入
    function resetFileInput() {
        fileUpload.value = '';
        imagePreview.style.display = 'none';
        imagePreview.src = '#';
        txtImgUrl.value = '';
        imageIds = '';
    }
    
// 表单提交验证 - 移出 if 条件块
    const form = document.getElementById('depositForm');    console.log(form,7654)
form.addEventListener('submit', function(e) {
    e.preventDefault();

    // 验证必填字段
    if (!txtImgUrl.value) {
        alert('请上传充值凭证');
        return;
    }
    
    const amount = parseFloat(document.getElementById('amount').value);
    if (isNaN(amount) || amount <= 0) {
        alert('请输入有效的充值金额');
        return;
    }
    
    const paytime = document.getElementById('paytime').value;
    if (!paytime) {
        alert('请选择汇款时间');
        return;
    }
    
    // 禁用提交按钮防止重复提交
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 提交中...';
    
    // 直接使用表单元素创建 FormData
    const formData = new FormData(form);
    
    // 提交表单数据
    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('网络响应不正常');
        }
        return response.json();
    })
    .then(data => {
        if (data.code == 1) {
            alert('充值申请提交成功！');
            window.location.href = "<?= urlCreate('/web/user/iwantrecharge') ?>";
        } else {
            throw new Error(data.msg || '未知错误');
        }
    })
    .catch(error => {
        alert('提交失败: ' + error.message);
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '提交申请';
    });
});
    
    // 支付方式过滤功能
    function filterPaymentMethods() {
        const transferType = document.querySelector('input[name="bank_type"]:checked')?.value;
        if (!transferType) return;

        document.querySelectorAll('.payment-option').forEach(option => {
            option.style.display = option.dataset.paymentType === transferType ? 'block' : 'none';
        });
    }

    // 初始化支付方式过滤
    document.querySelectorAll('input[name="bank_type"]').forEach(radio => {
        radio.addEventListener('change', filterPaymentMethods);
    });
    filterPaymentMethods(); // 初始执行
});
</script>
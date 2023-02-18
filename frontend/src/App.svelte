<script>
  let uploadingIMG, uploadedIMG, submit, fileDownload;
  let imageSize = 1;

  let gotFile = false;
  let gotImage = false;

  let file;

  function onChange() {
    const selectedFile = uploadingIMG.files[0];
    const fileReader = new FileReader;

    gotFile = !!selectedFile;
    gotImage = false;

    if (!gotFile) return;

    fileReader.readAsDataURL(selectedFile);

    fileReader.onload = () => {
      uploadedIMG.src = file = fileReader.result;
    };
  }

  async function onClick() {
    fetch("http://localhost:3000/tableImage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tableImage: file,
        imageSize
      })
    }).then(res => {
      if (res.ok) {
        gotImage = true;
        res.blob().then(blob => {
          const url = URL.createObjectURL(blob);
          fileDownload.href = url;
          fileDownload.download = "download.xlsx";
        });
      } else {
        console.error("error");
      }
    });
  }
</script>

<main>
  <h1>Table Image</h1>

  <hr>

  <h2>파일 업로드 하삼</h2>
  <input bind:this={uploadingIMG} on:change={onChange} type="file" accept="image/*">

  <h2>파일 크기 몇 배 줄일 건지 정하삼(자연수여야함)(파일 열리지 않으면 이거 높여서 다시 시도 ㄱㄱ)</h2>
  <input bind:value={imageSize} type="number">
  <span>배</span>

  <hr>

  {#if gotFile}
    <h2>선택된 이미지</h2>
    <img bind:this={uploadedIMG} alt="error"/>
    <hr>
    <button bind:this={submit} on:click={onClick}>생성하기(극심한 데이터 사용 있을 수 있음)</button>
  {/if}

  {#if gotImage}
    <a bind:this={fileDownload} href="none">다운로드하기</a>
  {/if}

</main>

<style>
  img {
    display: block;
    max-width: 100%;
  }
</style>
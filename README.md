## 初期設定
1. デプロイ用リポジトリをクローンする。
2. 新しいリモートリポジトリを作成する。
3. リモートリポジトリ作成後に表示されるコマンドをローカルで実行してリモートリポジトリ先を変更する。
    ```
    # デプロイ用リポジトリとの連携を切る。
    git remote remove origin
    # 新しいリモートリポジトリと連携する。xxxxxはリモートリポジトリ名。
    git remote add origin [git@github.com](mailto:git@github.com):xxxxx.git
    git branch -M main
    git push -u origin main
    # リモートリポジトリ先が変更されていることを確認する。
    git remote -v
    ```
4. コンテナのDB用ボリュームの名前を変える。
5. コンテナの作成と必要なものをインストールする。
    ```
    docker compose build
    docker compose run --rm web bundle install
    docker compose run --rm web yarn install
    ```
6. 「master.key」や「credentials.yml.enc」などを作成する。
    1. 「Rails new」に作成されるものだが、「master.key」は機密情報のためgitで管理されていない。そのため再作成する必要がある。
    2. 「credentials.yml.enc」が存在する場合、削除する。
    3. 下記のコマンドを実行すると「credentials.yml.enc」が作成され、vimで開かれる。「master.key」は自動で作成される。
        ```
        # コンテナに入る
        docker compose exec web bash
        # ファイルが開かれたら「:wq!」と入力しファイルを閉じる。
        EDITOR=vim bin/rails credentials:edit
        ```
    4. 「master.key」ファイルが開けない場合は下記のコードをルートで実行する。
        ```
        sudo chown -R $USER:$USER .
        ```

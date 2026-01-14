<template>
    <v-container class="py-12" style="max-width: 900px;">
        <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="$router.push('/')" class="mb-8 pl-0 text-grey">
            Voltar
        </v-btn>

        <h1 class="text-h3 font-weight-bold text-white mb-2">Central de Dúvidas</h1>
        <p class="text-h6 text-grey-lighten-1 mb-12">Tudo que você precisa saber para começar a usar o Movie Randomizer.
        </p>

        <v-expansion-panels variant="popout" class="mb-12">

            <v-expansion-panel title="O que é esse app?"
                text="O Movie Randomizer é uma ferramenta para ajudar você a escolher o que assistir. Ele se conecta ao seu Google Drive, lê uma lista de filmes/séries que você criou e sorteia um título aleatório, trazendo informações detalhadas sobre ele."
                bg-color="#1e1e2e"></v-expansion-panel>

            <v-expansion-panel title="Que lista eu tenho que criar?" bg-color="#1e1e2e">
                <v-expansion-panel-text>
                    <p class="mb-4">Você precisa ter um arquivo de texto simples no seu Google Drive. Pode ser um
                        <strong>Documento Google (Google Doc)</strong> ou um arquivo de texto (.txt).
                    </p>
                    <p class="mb-2"><strong>Regras para a lista:</strong></p>
                    <ul class="pl-4 mb-4">
                        <li>Um título por linha.</li>
                        <li>Não use numeração (1., 2., etc) nem marcadores.</li>
                        <li>Escreva apenas o nome do filme ou série.</li>
                    </ul>
                    <p class="text-grey-lighten-1 italic">Exemplo:</p>
                    <code class="d-block pa-4 rounded bg-black mb-4 text-green-accent-3">
                Breaking Bad<br>
                O Poderoso Chefão<br>
                Interestelar<br>
                Friends
            </code>
                </v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel title="Como conecto minha lista?" bg-color="#1e1e2e">
                <v-expansion-panel-text>
                    Ao fazer login, o sistema pedirá para você selecionar uma <strong>Pasta</strong> do Google Drive.
                    <br><br>
                    Dentro dessa pasta, você verá seus arquivos.
                    <ul class="pl-4 mt-2">
                        <li>Selecione qualquer arquivo (Google Doc ou Texto) que contenha sua lista.</li>
                        <li>Se não tiver nenhum, clique em <strong>"Criar Nova Lista Aqui"</strong> para começar do
                            zero.</li>
                    </ul>
                </v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel title="Como adiciono filmes à lista?" bg-color="#1e1e2e">
                <v-expansion-panel-text>
                    Você pode editar seu arquivo diretamente no Google Drive, ou usar o botão <strong>"Adicionar
                        Item"</strong> na tela principal.
                    <br><br>
                    Com essa função, você pesquisa o filme/série e o sistema adiciona automaticamente na sua lista com o
                    nome, ano e tipo corretos.
                </v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel title="O que o sistema faz com minha lista?" bg-color="#1e1e2e">
                <v-expansion-panel-text>
                    Ele lê os títulos linha por linha. Quando você sorteia um filme e marca como "Assistido", o sistema
                    atualiza
                    o arquivo adicionando uma etiqueta (ex: [ASSISTIDO]) ao lado do nome.
                    <br><br>
                    Ele é inteligente o suficiente para ignorar linhas vazias.
                </v-expansion-panel-text>
            </v-expansion-panel>

        </v-expansion-panels>

        <v-card color="primary" class="pa-8 text-center rounded-xl" elevation="12">
            <v-icon icon="mdi-lightbulb-on-outline" size="48" class="mb-4 text-yellow-accent-2"></v-icon>
            <h3 class="text-h5 font-weight-bold mb-2">Pronto para começar?</h3>
            <p class="mb-6">Agora que você já sabe como funciona, conecte sua conta e acabe com a indecisão.</p>
            <v-btn color="white" variant="flat" size="large" rounded="pill" class="text-primary font-weight-bold"
                @click="$router.push('/')">Ir para Início</v-btn>
        </v-card>

    </v-container>
</template>

<script setup>
</script>

<style scoped>
/* Optional specific styles if needed */
</style>

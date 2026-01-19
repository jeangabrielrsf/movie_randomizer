<template>
    <v-container class="pt-16 pb-12" style="max-width: 800px;">
        <v-card class="pa-8" rounded="xl" elevation="4">
            <h1 class="text-h4 font-weight-bold mb-6">Política de Privacidade</h1>

            <p class="mb-4 text-body-1">
                Última atualização: {{ new Date().toLocaleDateString() }}
            </p>

            <section class="mb-6">
                <h2 class="text-h6 font-weight-bold mb-2">1. Introdução</h2>
                <p class="text-body-2 text-grey-lighten-4">
                    O <strong>Movie Randomizer</strong> ("nós", "nosso") respeita a sua privacidade. Esta Política de
                    Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você usa
                    nosso aplicativo.
                </p>
            </section>

            <section class="mb-6">
                <h2 class="text-h6 font-weight-bold mb-2">2. Coleta de Informações</h2>
                <p class="text-body-2 text-grey-lighten-4">
                    Coletamos as seguintes informações quando você usa o aplicativo:
                </p>
                <ul class="ml-6 text-body-2 text-grey-lighten-4">
                    <li><strong>Informações da Conta Google:</strong> Apenas o necessário para autenticação e acesso ao
                        arquivo selecionado no Google Drive.</li>
                    <li><strong>Arquivos do Google Drive:</strong> Nosso aplicativo acessa <em>apenas</em> o arquivo
                        específico que você seleciona para ler e atualizar sua lista de filmes/séries. Não temos acesso
                        a nenhum outro arquivo em seu Google Drive.</li>
                </ul>
            </section>

            <section class="mb-6">
                <h2 class="text-h6 font-weight-bold mb-2">3. Uso das Informações</h2>
                <p class="text-body-2 text-grey-lighten-4">
                    Usamos as informações coletadas para:
                </p>
                <ul class="ml-6 text-body-2 text-grey-lighten-4">
                    <li>Ler sua lista de filmes para fornecer a funcionalidade de "randomização".</li>
                    <li>Marcar filmes como "assistidos" no seu arquivo selecionado.</li>
                    <li>Melhorar a funcionalidade do aplicativo.</li>
                </ul>
                <p class="text-body-2 text-grey-lighten-4 mt-2">
                    Não compartilhamos, vendemos ou alugamos suas informações pessoais com terceiros.
                </p>
            </section>

            <section class="mb-6">
                <h2 class="text-h6 font-weight-bold mb-2">4. Segurança</h2>
                <p class="text-body-2 text-grey-lighten-4">
                    Usamos métodos de segurança padrão da indústria para proteger suas informações. No entanto, nenhum
                    método de transmissão pela Internet é 100% seguro.
                </p>
            </section>

            <section class="mb-6">
                <h2 class="text-h6 font-weight-bold mb-2">5. Contato</h2>
                <p class="text-body-2 text-grey-lighten-4">
                    Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco pelo e-mail:
                    jeang96@gmail.com
                </p>
            </section>

            <v-btn to="/faq" variant="text" color="primary" class="mt-4">Voltar</v-btn>
        </v-card>
    </v-container>
</template>
